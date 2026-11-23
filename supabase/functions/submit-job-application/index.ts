// supabase/functions/submit-job-application/index.ts
//
// The ONLY write path into public.job_applications.
//
// Why a function rather than a public INSERT policy: applicant records are
// sensitive personal information, so the anon key is given no access to the
// table at all. Everything an applicant sends is validated here - against the
// listing's own configuration - and then written with the service-role key.
//
// Responsibilities, in order:
//   1. Confirm the listing exists, is published and is still accepting.
//   2. Validate and clamp every field (types, lengths, URL schemes).
//   3. Validate questionnaire answers: required, allowed options, lengths.
//   4. Apply screening (knock-out) rules. A failing applicant is refused
//      BEFORE anything is stored or uploaded - nothing to delete later.
//   5. Rate-limit by salted IP hash and by email.
//   6. Reject duplicate applications for the same role.
//   7. Upload the CV to the private bucket, then insert the row and answers.
//   8. Email the applicant an acknowledgement and notify the hiring inbox.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import { sendApplicantAck, sendAdminNotice } from '../_shared/careers-email.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY') || ''
const SITE_URL = Deno.env.get('SITE_URL') || 'https://www.kingofthepitch.com.au'
const NOTIFY_EMAIL = Deno.env.get('CAREERS_NOTIFY_EMAIL') || 'kotp.football@gmail.com'
// Used only as an HMAC key for rate-limit hashes; never stored or logged.
const IP_SALT = Deno.env.get('APPLICATION_IP_SALT') || SERVICE_KEY

const BUCKET = 'job-applications'
const MAX_RESUME_BYTES = 5 * 1024 * 1024 // 5 MB
const CONSENT_VERSION = '2026-11-23'

// Caps mirror the column types and keep a single oversized field from
// ballooning a row. Anything longer is a copy-paste accident or an attack.
const LIMITS = {
  name: 80,
  email: 254,
  phone: 40,
  place: 120,
  shortText: 200,
  url: 500,
  notes: 2000,
  coverLetter: 8000,
  answer: 5000,
  label: 120,
  projectTitle: 160,
  projectDescription: 1500,
  linkCount: 8,
  projectCount: 10,
  answerCount: 50,
}

const ALLOWED_RESUME_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/rtf',
  'text/plain',
])

const ALLOWED_RESUME_EXT = new Set(['pdf', 'doc', 'docx', 'rtf', 'txt'])

const WORK_RIGHTS = new Set([
  'citizen', 'permanent_resident', 'visa_with_work_rights',
  'student_visa', 'requires_sponsorship', 'other',
])

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// ── helpers ──────────────────────────────────────────────────────────────────

const json = (body: unknown, status: number, cors: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })

/** Trim, collapse control characters, and clamp to `max`. Returns null if empty. */
const text = (value: unknown, max: number): string | null => {
  if (value === null || value === undefined) return null
  const cleaned = String(value)
    // Strip C0/C1 control characters except tab and newline.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .trim()
  if (!cleaned) return null
  return cleaned.slice(0, max)
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

/** Accepts only absolute http(s) URLs. Anything else (javascript:, data:) is dropped. */
const safeUrl = (value: unknown): string | null => {
  const raw = text(value, LIMITS.url)
  if (!raw) return null
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    if (!parsed.hostname.includes('.')) return null
    return parsed.toString().slice(0, LIMITS.url)
  } catch {
    return null
  }
}

const isoDate = (value: unknown): string | null => {
  const raw = text(value, 10)
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const parsed = new Date(`${raw}T00:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? null : raw
}

const finiteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const hmacHex = async (key: string, message: string): Promise<string> => {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw', encoder.encode(key || 'kotp-careers'),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map(byte => byte.toString(16).padStart(2, '0')).join('')
}

const clientIp = (req: Request): string =>
  (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
  req.headers.get('cf-connecting-ip') || 'unknown'

/** Unambiguous alphabet: no I, O, 0 or 1. */
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const makeReference = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return `KOTP-${Array.from(bytes).map(b => REF_ALPHABET[b % REF_ALPHABET.length]).join('')}`
}

const normalise = (value: unknown): string =>
  String(value ?? '').trim().toLowerCase()

/** File signatures, as a cheap guard against a renamed executable. */
const signatureOk = (bytes: Uint8Array, ext: string): boolean => {
  const starts = (...sig: number[]) => sig.every((byte, i) => bytes[i] === byte)
  switch (ext) {
    case 'pdf':  return starts(0x25, 0x50, 0x44, 0x46)                   // %PDF
    case 'docx': return starts(0x50, 0x4B, 0x03, 0x04) ||
                        starts(0x50, 0x4B, 0x05, 0x06)                   // ZIP
    case 'doc':  return starts(0xD0, 0xCF, 0x11, 0xE0)                   // OLE2
    case 'rtf':  return starts(0x7B, 0x5C, 0x72, 0x74)                   // {\rt
    case 'txt':  return true
    default:     return false
  }
}

// ── questionnaire validation ─────────────────────────────────────────────────

interface Question {
  id: string
  position: number
  label: string
  question_type: string
  options: unknown
  required: boolean
  max_length: number | null
  is_knockout: boolean
  knockout_expected: unknown
  knockout_min: number | null
  knockout_max: number | null
  knockout_message: string | null
}

interface PreparedAnswer {
  question_id: string
  question_label: string
  question_type: string
  position: number
  answer: unknown
}

type AnswerOutcome =
  | { ok: true; answers: PreparedAnswer[] }
  | { ok: false; status: number; error: string; message: string; questionId?: string }

const optionList = (question: Question): string[] =>
  Array.isArray(question.options) ? question.options.map(o => String(o)) : []

const expectedList = (question: Question): string[] =>
  Array.isArray(question.knockout_expected)
    ? question.knockout_expected.map(v => normalise(v))
    : []

const prepareAnswers = (questions: Question[], raw: Record<string, unknown>): AnswerOutcome => {
  const answers: PreparedAnswer[] = []

  for (const question of questions) {
    const supplied = raw?.[question.id]
    const options = optionList(question)
    let value: unknown = null

    switch (question.question_type) {
      case 'boolean': {
        if (supplied === true || normalise(supplied) === 'true' || normalise(supplied) === 'yes') value = true
        else if (supplied === false || normalise(supplied) === 'false' || normalise(supplied) === 'no') value = false
        else value = null
        break
      }
      case 'number': {
        value = finiteNumber(supplied)
        break
      }
      case 'date': {
        value = isoDate(supplied)
        break
      }
      case 'url': {
        value = safeUrl(supplied)
        break
      }
      case 'single_select': {
        const picked = text(supplied, LIMITS.shortText)
        value = picked && options.some(o => normalise(o) === normalise(picked))
          ? options.find(o => normalise(o) === normalise(picked))
          : null
        break
      }
      case 'multi_select': {
        const list = Array.isArray(supplied) ? supplied : supplied ? [supplied] : []
        const picked = list
          .map(item => options.find(o => normalise(o) === normalise(item)))
          .filter((item): item is string => Boolean(item))
        value = picked.length ? Array.from(new Set(picked)) : null
        break
      }
      default: { // short_text, long_text
        const cap = Math.min(question.max_length ?? LIMITS.answer, LIMITS.answer)
        value = text(supplied, cap)
        break
      }
    }

    const isEmpty = value === null || value === undefined ||
      (Array.isArray(value) && value.length === 0)

    if (question.required && isEmpty) {
      return {
        ok: false, status: 400, error: 'answer_required',
        message: `Please answer: ${question.label}`,
        questionId: question.id,
      }
    }

    // Screening: refuse up-front rather than storing a record we would reject.
    if (question.is_knockout && !isEmpty) {
      const accepted = expectedList(question)
      let passed = true

      if (question.question_type === 'number') {
        const numeric = Number(value)
        if (question.knockout_min !== null && numeric < Number(question.knockout_min)) passed = false
        if (question.knockout_max !== null && numeric > Number(question.knockout_max)) passed = false
        if (accepted.length && !accepted.includes(normalise(numeric))) passed = false
      } else if (accepted.length) {
        if (Array.isArray(value)) {
          // Multi-select passes when at least one accepted option was chosen.
          passed = value.some(item => accepted.includes(normalise(item)))
        } else {
          passed = accepted.includes(normalise(value))
        }
      }

      if (!passed) {
        return {
          ok: false, status: 422, error: 'screening_failed',
          message: question.knockout_message ||
            'Based on your answers, this role has a requirement your application does not meet.',
          questionId: question.id,
        }
      }
    }

    if (!isEmpty) {
      answers.push({
        question_id: question.id,
        question_label: question.label.slice(0, LIMITS.label),
        question_type: question.question_type,
        position: question.position,
        answer: value,
      })
    }
  }

  return { ok: true, answers: answers.slice(0, LIMITS.answerCount) }
}

// ── handler ──────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const cors = {
    ...getCorsHeaders(req.headers.get('origin')),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, cors)

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('submit-job-application: service credentials are not configured')
    return json({ error: 'server_misconfigured' }, 500, cors)
  }

  let uploadedPath: string | null = null
  let insertedId: string | null = null

  try {
    // ── 1. Parse the multipart body ──
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return json({ error: 'bad_request', message: 'Expected multipart/form-data.' }, 400, cors)
    }

    const form = await req.formData()
    const rawPayload = form.get('payload')
    if (typeof rawPayload !== 'string') {
      return json({ error: 'bad_request', message: 'Missing application payload.' }, 400, cors)
    }
    if (rawPayload.length > 200_000) {
      return json({ error: 'payload_too_large', message: 'Your application is too long.' }, 413, cors)
    }

    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(rawPayload)
    } catch {
      return json({ error: 'bad_request', message: 'Malformed application payload.' }, 400, cors)
    }

    // Honeypot: a real applicant never sees this field.
    if (text(payload.honeypot, 50)) {
      console.warn('submit-job-application: honeypot triggered')
      // Answer as though it worked, so a bot learns nothing.
      return json({ ok: true, reference: makeReference() }, 200, cors)
    }

    // ── 2. Load the listing and confirm it is accepting applications ──
    const jobId = text(payload.jobId, 36)
    if (!jobId || !/^[0-9a-f-]{36}$/i.test(jobId)) {
      return json({ error: 'bad_request', message: 'Unknown role.' }, 400, cors)
    }

    const { data: listing, error: listingError } = await supabaseAdmin
      .from('job_listings')
      .select('id, title, status, application_deadline, requires_resume, allow_cover_letter, allow_projects, allow_links, contact_email')
      .eq('id', jobId)
      .maybeSingle()

    if (listingError) {
      console.error({ listingError })
      return json({ error: 'server_error' }, 500, cors)
    }
    if (!listing || listing.status !== 'open') {
      return json({
        error: 'closed',
        message: 'This role is no longer accepting applications.',
      }, 409, cors)
    }
    if (listing.application_deadline) {
      const deadline = new Date(`${listing.application_deadline}T23:59:59Z`)
      if (Date.now() > deadline.getTime()) {
        return json({
          error: 'closed',
          message: 'Applications for this role have closed.',
        }, 409, cors)
      }
    }

    // ── 3. Validate the applicant's own details ──
    const firstName = text(payload.firstName, LIMITS.name)
    const lastName = text(payload.lastName, LIMITS.name)
    const email = text(payload.email, LIMITS.email)?.toLowerCase() ?? null

    if (!firstName || !lastName) {
      return json({ error: 'bad_request', message: 'Please give your first and last name.' }, 400, cors)
    }
    if (!email || !isEmail(email)) {
      return json({ error: 'bad_request', message: 'Please give a valid email address.' }, 400, cors)
    }
    if (payload.consentGiven !== true) {
      return json({
        error: 'consent_required',
        message: 'Please confirm you agree to KOTP handling your application.',
      }, 400, cors)
    }

    const workRights = text(payload.workRights, 40)
    const otherLinks = (Array.isArray(payload.otherLinks) ? payload.otherLinks : [])
      .slice(0, LIMITS.linkCount)
      .map((item: Record<string, unknown>) => ({
        label: text(item?.label, LIMITS.label) || 'Link',
        url: safeUrl(item?.url),
      }))
      .filter(item => item.url)

    const projects = (Array.isArray(payload.projects) ? payload.projects : [])
      .slice(0, LIMITS.projectCount)
      .map((item: Record<string, unknown>) => ({
        title: text(item?.title, LIMITS.projectTitle),
        url: safeUrl(item?.url),
        description: text(item?.description, LIMITS.projectDescription),
      }))
      .filter(item => item.title || item.url || item.description)

    // ── 4. Validate questionnaire answers and apply screening ──
    const { data: questionRows, error: questionsError } = await supabaseAdmin
      .from('job_questions')
      .select('id, position, label, question_type, options, required, max_length, is_knockout, knockout_expected, knockout_min, knockout_max, knockout_message')
      .eq('job_id', jobId)
      .order('position', { ascending: true })

    if (questionsError) {
      console.error({ questionsError })
      return json({ error: 'server_error' }, 500, cors)
    }

    const rawAnswers = (payload.answers && typeof payload.answers === 'object')
      ? payload.answers as Record<string, unknown>
      : {}

    const prepared = prepareAnswers((questionRows || []) as Question[], rawAnswers)
    if (!prepared.ok) {
      return json({
        error: prepared.error,
        message: prepared.message,
        questionId: prepared.questionId,
      }, prepared.status, cors)
    }

    // ── 5. Rate limits (salted hash; the raw address is never stored) ──
    const ipHash = await hmacHex(IP_SALT, clientIp(req))
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const [{ count: ipCount }, { count: emailCount }] = await Promise.all([
      supabaseAdmin.from('job_applications')
        .select('id', { count: 'exact', head: true })
        .eq('submitted_ip_hash', ipHash).gte('created_at', since),
      // Exact match, not ilike: an underscore in an address is an ilike
      // wildcard, which would over-count unrelated applicants.
      supabaseAdmin.from('job_applications')
        .select('id', { count: 'exact', head: true })
        .eq('email', email).gte('created_at', since),
    ])

    if ((ipCount ?? 0) >= 5 || (emailCount ?? 0) >= 3) {
      return json({
        error: 'rate_limited',
        message: 'You have submitted several applications recently. Please try again later.',
      }, 429, cors)
    }

    // ── 6. One application per person per role ──
    const { data: existing } = await supabaseAdmin
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return json({
        error: 'duplicate',
        message: 'You have already applied for this role. Email us if you need to update your application.',
      }, 409, cors)
    }

    // ── 7. Validate and store the CV ──
    const applicationId = crypto.randomUUID()
    const resume = form.get('resume')
    const hasResume = resume instanceof File && resume.size > 0

    let resumeFilename: string | null = null
    let resumeMime: string | null = null
    let resumeSize: number | null = null

    if (listing.requires_resume && !hasResume) {
      return json({
        error: 'resume_required',
        message: 'This role requires a resume or CV.',
      }, 400, cors)
    }

    if (hasResume) {
      const file = resume as File
      if (file.size > MAX_RESUME_BYTES) {
        return json({
          error: 'file_too_large',
          message: 'Your CV must be 5 MB or smaller.',
        }, 413, cors)
      }

      const ext = (file.name.split('.').pop() || '').toLowerCase()
      if (!ALLOWED_RESUME_EXT.has(ext) || !ALLOWED_RESUME_MIME.has(file.type)) {
        return json({
          error: 'file_type',
          message: 'Please upload your CV as a PDF, DOC, DOCX, RTF or TXT file.',
        }, 415, cors)
      }

      const bytes = new Uint8Array(await file.arrayBuffer())
      if (!signatureOk(bytes, ext)) {
        return json({
          error: 'file_type',
          message: `That file does not look like a valid .${ext} document.`,
        }, 415, cors)
      }

      // The stored name is generated: a user-supplied filename never reaches
      // the storage path. The original is kept in a column for display.
      const storagePath = `applications/${jobId}/${applicationId}/cv.${ext}`
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, bytes, {
          contentType: file.type,
          upsert: false,
          cacheControl: 'no-store',
        })

      if (uploadError) {
        console.error({ uploadError })
        return json({
          error: 'upload_failed',
          message: 'We could not store your CV. Please try again.',
        }, 500, cors)
      }

      uploadedPath = storagePath
      resumeFilename = (text(file.name, 160) || `cv.${ext}`).replace(/[/\\]/g, '_')
      resumeMime = file.type
      resumeSize = file.size
    }

    // ── 8. Insert the application ──
    const record = {
      id: applicationId,
      job_id: jobId,
      job_title_snapshot: listing.title,
      reference: makeReference(),
      first_name: firstName,
      last_name: lastName,
      email,
      phone: text(payload.phone, LIMITS.phone),
      city: text(payload.city, LIMITS.place),
      state: text(payload.state, LIMITS.place),
      country: text(payload.country, LIMITS.place),
      work_rights: workRights && WORK_RIGHTS.has(workRights) ? workRights : null,
      work_rights_notes: text(payload.workRightsNotes, LIMITS.notes),
      available_from: isoDate(payload.availableFrom),
      notice_period: text(payload.noticePeriod, LIMITS.shortText),
      salary_expectation: text(payload.salaryExpectation, LIMITS.shortText),
      years_experience: (() => {
        const years = finiteNumber(payload.yearsExperience)
        return years === null ? null : Math.min(Math.max(years, 0), 70)
      })(),
      linkedin_url: listing.allow_links === false ? null : safeUrl(payload.linkedinUrl),
      portfolio_url: listing.allow_links === false ? null : safeUrl(payload.portfolioUrl),
      github_url: listing.allow_links === false ? null : safeUrl(payload.githubUrl),
      other_links: listing.allow_links === false ? [] : otherLinks,
      projects: listing.allow_projects === false ? [] : projects,
      cover_letter: listing.allow_cover_letter === false
        ? null : text(payload.coverLetter, LIMITS.coverLetter),
      additional_info: text(payload.additionalInfo, LIMITS.coverLetter),
      heard_about: text(payload.heardAbout, LIMITS.shortText),
      resume_path: uploadedPath,
      resume_filename: resumeFilename,
      resume_size: resumeSize,
      resume_mime: resumeMime,
      consent_given: true,
      consent_version: text(payload.consentVersion, 40) || CONSENT_VERSION,
      consent_at: new Date().toISOString(),
      submitted_ip_hash: ipHash,
      status: 'new',
    }

    let inserted: { id: string; reference: string } | null = null
    for (let attempt = 0; attempt < 4 && !inserted; attempt += 1) {
      const { data, error } = await supabaseAdmin
        .from('job_applications')
        .insert({ ...record, reference: attempt === 0 ? record.reference : makeReference() })
        .select('id, reference')
        .single()

      if (!error) { inserted = data; break }

      // 23505 = unique violation. A clashing reference is retried; a clashing
      // (job, email) means they applied between our check and this insert.
      if (error.code === '23505') {
        if (String(error.message).includes('reference')) continue
        if (uploadedPath) await supabaseAdmin.storage.from(BUCKET).remove([uploadedPath])
        return json({
          error: 'duplicate',
          message: 'You have already applied for this role.',
        }, 409, cors)
      }

      console.error({ insertError: error })
      if (uploadedPath) await supabaseAdmin.storage.from(BUCKET).remove([uploadedPath])
      return json({
        error: 'server_error',
        message: 'We could not record your application. Please try again.',
      }, 500, cors)
    }

    if (!inserted) {
      if (uploadedPath) await supabaseAdmin.storage.from(BUCKET).remove([uploadedPath])
      return json({ error: 'server_error', message: 'Please try again.' }, 500, cors)
    }
    insertedId = inserted.id

    // ── 9. Insert the questionnaire answers ──
    if (prepared.answers.length) {
      const { error: answersError } = await supabaseAdmin
        .from('job_application_answers')
        .insert(prepared.answers.map(answer => ({
          application_id: insertedId,
          question_id: answer.question_id,
          question_label: answer.question_label,
          question_type: answer.question_type,
          position: answer.position,
          answer: answer.answer,
        })))

      if (answersError) {
        // Partial applications are worse than none: roll the whole thing back
        // so the applicant can resubmit cleanly.
        console.error({ answersError })
        await supabaseAdmin.from('job_applications').delete().eq('id', insertedId)
        if (uploadedPath) await supabaseAdmin.storage.from(BUCKET).remove([uploadedPath])
        return json({
          error: 'server_error',
          message: 'We could not save your answers. Please try again.',
        }, 500, cors)
      }
    }

    // ── 10. Email, best effort ──
    const applicantName = `${firstName} ${lastName}`.trim()
    await Promise.allSettled([
      sendApplicantAck({
        to: email,
        applicantName: firstName,
        jobTitle: listing.title,
        reference: inserted.reference,
        siteUrl: SITE_URL,
        privacyEmail: listing.contact_email || NOTIFY_EMAIL,
      }),
      sendAdminNotice({
        to: NOTIFY_EMAIL,
        applicantName,
        applicantEmail: email,
        jobTitle: listing.title,
        reference: inserted.reference,
        dashboardUrl: `${SITE_URL.replace(/\/$/, '')}/admin/dashboard`,
        hasResume: Boolean(uploadedPath),
        answerCount: prepared.answers.length,
      }),
    ])

    return json({ ok: true, reference: inserted.reference }, 200, cors)
  } catch (err) {
    console.error({ criticalError: (err as Error)?.message ?? String(err) })
    // Never leave an orphaned object or half-written row behind.
    if (insertedId) await supabaseAdmin.from('job_applications').delete().eq('id', insertedId)
    if (uploadedPath) await supabaseAdmin.storage.from(BUCKET).remove([uploadedPath])
    return json({
      error: 'server_error',
      message: 'Something went wrong. Please try again.',
    }, 500, cors)
  }
})
