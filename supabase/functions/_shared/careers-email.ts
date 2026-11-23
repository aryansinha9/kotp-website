// supabase/functions/_shared/careers-email.ts
//
// Transactional email for the careers job board.
//
// Two messages are sent for each accepted application:
//   1. an acknowledgement to the applicant (with their reference), and
//   2. a notification to the hiring inbox.
//
// Both are best-effort. An application that is safely recorded must never be
// reported as failed because a mail provider is having a bad day, so every
// function here swallows its errors and logs them.

import { Resend } from 'https://esm.sh/resend@3.2.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// Verified Resend sending domain (DKIM-signed as send.kingofthepitch.com.au).
const FROM = 'King of the Pitch <noreply@send.kingofthepitch.com.au>'
const REPLY_TO = 'kotp.football@gmail.com'
const BRAND = '#FF6B00'

export const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export interface ApplicantAck {
  to: string
  applicantName: string
  jobTitle: string
  reference: string
  /** Public careers URL, used for the footer link. */
  siteUrl: string
  /** Where an applicant should write to exercise their privacy rights. */
  privacyEmail?: string
}

export interface AdminNotice {
  to: string
  applicantName: string
  applicantEmail: string
  jobTitle: string
  reference: string
  dashboardUrl: string
  hasResume: boolean
  answerCount: number
}

const shell = (heading: string, body: string, footer: string): string => `
<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="background:#0a0a0a;padding:24px 28px;">
          <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.08em;">KING OF THE PITCH</span>
          <span style="display:block;color:${BRAND};font-size:12px;letter-spacing:0.18em;margin-top:4px;">CAREERS</span>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">${heading}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:18px 28px;background:#fafafa;border-top:1px solid #eeeeee;color:#6b7280;font-size:12px;line-height:1.6;">
          ${footer}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

const send = async (
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<{ ok: boolean; id?: string; error?: string }> => {
  if (!RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY is not configured' }

  const recipient = (to || '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    return { ok: false, error: `No valid recipient address (got: ${recipient || 'empty'})` }
  }

  try {
    const resend = new Resend(RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: recipient,
      replyTo: REPLY_TO,
      subject,
      html,
      text,
    })
    if (error) {
      return { ok: false, error: typeof error === 'string' ? error : JSON.stringify(error) }
    }
    return { ok: true, id: data?.id }
  } catch (err) {
    return { ok: false, error: (err as Error)?.message ?? String(err) }
  }
}

export const sendApplicantAck = async (payload: ApplicantAck): Promise<void> => {
  const name = escapeHtml(payload.applicantName)
  const title = escapeHtml(payload.jobTitle)
  const ref = escapeHtml(payload.reference)
  const privacyEmail = escapeHtml(payload.privacyEmail || REPLY_TO)
  const careersUrl = `${payload.siteUrl.replace(/\/$/, '')}/careers`

  const html = shell(
    `Thanks, ${name} - we've got your application`,
    `<p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">
       Your application for <strong>${title}</strong> has been received.
     </p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;">
       <tr><td style="padding:14px 18px;">
         <span style="display:block;color:#9a3412;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;">Your reference</span>
         <span style="display:block;color:#111827;font-size:18px;font-weight:700;margin-top:4px;">${ref}</span>
       </td></tr>
     </table>
     <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">
       Our team reviews every application. If your experience lines up with what the role needs,
       we'll be in touch to arrange a conversation. Quote your reference in any follow-up.
     </p>
     <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
       Please don't reply with further documents - if we need anything else, we'll ask.
     </p>`,
    `We hold your application and any attached CV only to assess you for this role and, where
     relevant, future openings, and we delete it when it is no longer needed.
     To access, correct or delete your information, email
     <a href="mailto:${privacyEmail}" style="color:${BRAND};">${privacyEmail}</a>.<br>
     <a href="${escapeHtml(careersUrl)}" style="color:${BRAND};">kingofthepitch.com.au/careers</a>`,
  )

  const text = [
    `Thanks, ${payload.applicantName} - we've got your application.`,
    ``,
    `Role: ${payload.jobTitle}`,
    `Reference: ${payload.reference}`,
    ``,
    `Our team reviews every application and will be in touch if your experience lines up with the role.`,
    ``,
    `We hold your application and any attached CV only to assess you for this role and, where relevant,`,
    `future openings, and delete it when it is no longer needed. To access, correct or delete your`,
    `information, email ${payload.privacyEmail || REPLY_TO}.`,
  ].join('\n')

  const result = await send(payload.to, `Application received - ${payload.jobTitle}`, html, text)
  if (result.ok) {
    console.log(`Applicant acknowledgement sent (resend id: ${result.id})`)
  } else {
    console.error(`Applicant acknowledgement NOT sent: ${result.error}`)
  }
}

export const sendAdminNotice = async (payload: AdminNotice): Promise<void> => {
  const rows: Array<[string, string]> = [
    ['Role', payload.jobTitle],
    ['Applicant', payload.applicantName],
    ['Email', payload.applicantEmail],
    ['Reference', payload.reference],
    ['CV attached', payload.hasResume ? 'Yes' : 'No'],
    ['Screening answers', String(payload.answerCount)],
  ]

  const html = shell(
    'New job application',
    `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 18px;">
       ${rows.map(([label, value]) => `
         <tr>
           <td style="padding:9px 0;color:#6b7280;font-size:13px;width:42%;vertical-align:top;">${escapeHtml(label)}</td>
           <td style="padding:9px 0;color:#111827;font-size:13px;font-weight:600;">${escapeHtml(value)}</td>
         </tr>`).join('')}
     </table>
     <a href="${escapeHtml(payload.dashboardUrl)}"
        style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:7px;font-size:14px;font-weight:600;">
       Open in the dashboard
     </a>`,
    `Applicant details and CVs are only accessible to signed-in KOTP admins. This email
     deliberately carries no attachments or links to the CV itself.`,
  )

  const text = [
    'New job application',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    `Review it here: ${payload.dashboardUrl}`,
  ].join('\n')

  const result = await send(payload.to, `New application: ${payload.jobTitle}`, html, text)
  if (result.ok) {
    console.log(`Admin notification sent (resend id: ${result.id})`)
  } else {
    console.error(`Admin notification NOT sent: ${result.error}`)
  }
}
