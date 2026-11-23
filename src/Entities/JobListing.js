// src/Entities/JobListing.js
//
// Data access for careers job listings and their screening questions.
//
// Two audiences share this module:
//   * the public Careers pages, which read published listings with the anon
//     key and the column-limited `open_job_questions` view, and
//   * the admin dashboard, which reads and writes everything with an admin
//     session. RLS (see supabase/careers_job_board.sql) is what actually
//     separates the two - these helpers only pick sensible column lists.

import { supabase } from '@/supabaseClient';

// Columns safe to send to the public. (Every listing column is non-sensitive,
// but `created_by` identifies a staff account, so it is left out.)
const PUBLIC_LISTING_COLUMNS = `
  id, slug, title, status, department, location, workplace_type, employment_type,
  experience_level, summary, description, responsibilities, requirements,
  qualifications, benefits, skills, about_team, how_to_apply,
  salary_min, salary_max, salary_currency, salary_period, salary_visible,
  openings, published_at, application_deadline, contact_email,
  requires_resume, allow_cover_letter, allow_projects, allow_links, sort_order
`;

export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full time' },
  { value: 'part_time', label: 'Part time' },
  { value: 'contract', label: 'Contract' },
  { value: 'casual', label: 'Casual' },
  { value: 'internship', label: 'Internship' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'seasonal', label: 'Seasonal' },
];

export const WORKPLACE_TYPES = [
  { value: 'on_site', label: 'On site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
];

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
  { value: 'executive', label: 'Executive' },
];

export const LISTING_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
];

export const QUESTION_TYPES = [
  { value: 'short_text', label: 'Short text' },
  { value: 'long_text', label: 'Long text' },
  { value: 'single_select', label: 'Single choice' },
  { value: 'multi_select', label: 'Multiple choice' },
  { value: 'boolean', label: 'Yes / No' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'Link' },
];

export const labelFor = (list, value) =>
  list.find(item => item.value === value)?.label || value || '';

/** "Mid level · Full time · Hybrid · Sydney" style metadata line. */
export const listingMeta = (listing) => [
  labelFor(EMPLOYMENT_TYPES, listing?.employment_type),
  labelFor(WORKPLACE_TYPES, listing?.workplace_type),
  listing?.location,
  listing?.department,
].filter(Boolean);

export const formatSalary = (listing) => {
  if (!listing?.salary_visible) return null;
  const { salary_min: min, salary_max: max, salary_currency: currency, salary_period: period } = listing;
  if (min == null && max == null) return null;
  const money = (value) =>
    new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency || 'AUD',
      maximumFractionDigits: 0,
    }).format(Number(value));
  const range = min != null && max != null && Number(min) !== Number(max)
    ? `${money(min)} - ${money(max)}`
    : money(min ?? max);
  return `${range} per ${period || 'year'}`;
};

export const isAcceptingApplications = (listing) => {
  if (!listing || listing.status === 'closed' || listing.status === 'archived') return false;
  if (listing.status === 'draft') return false;
  if (!listing.application_deadline) return true;
  const deadline = new Date(`${listing.application_deadline}T23:59:59`);
  return deadline.getTime() >= Date.now();
};

export const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const JobListingAPI = {
  // ── Public ────────────────────────────────────────────────────────────────

  /** Published listings for the Careers page. RLS hides everything else. */
  listPublished: async () => {
    const { data, error } = await supabase
      .from('job_listings')
      .select(PUBLIC_LISTING_COLUMNS)
      .eq('status', 'open')
      .order('sort_order', { ascending: true })
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error loading job listings:', error.message);
      return [];
    }
    // A role past its deadline stays visible but is marked closed in the UI;
    // the server refuses its applications either way.
    return data || [];
  },

  /** One published listing plus its questionnaire, by slug. */
  getPublishedBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('job_listings')
      .select(PUBLIC_LISTING_COLUMNS)
      .eq('slug', slug)
      .eq('status', 'open')
      .maybeSingle();

    if (error) {
      console.error('Error loading job listing:', error.message);
      return null;
    }
    if (!data) return null;

    // `open_job_questions` deliberately omits the screening answer keys.
    const { data: questions, error: questionsError } = await supabase
      .from('open_job_questions')
      .select('id, position, label, help_text, question_type, options, required, max_length')
      .eq('job_id', data.id)
      .order('position', { ascending: true });

    if (questionsError) console.error('Error loading questions:', questionsError.message);

    return { ...data, questions: questions || [] };
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  listAll: async () => {
    const { data, error } = await supabase
      .from('job_listings')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading listings:', error.message);
      return { data: [], error };
    }
    return { data: data || [], error: null };
  },

  getQuestions: async (jobId) => {
    const { data, error } = await supabase
      .from('job_questions')
      .select('*')
      .eq('job_id', jobId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error loading questions:', error.message);
      return { data: [], error };
    }
    return { data: data || [], error: null };
  },

  create: async (listing) => {
    const { data: { user } } = await supabase.auth.getUser();
    return supabase
      .from('job_listings')
      .insert({ ...listing, created_by: user?.id ?? null })
      .select('*')
      .single();
  },

  update: (id, patch) =>
    supabase.from('job_listings').update(patch).eq('id', id).select('*').single(),

  remove: (id) => supabase.from('job_listings').delete().eq('id', id),

  /**
   * Replaces a listing's questionnaire wholesale: rows the admin removed are
   * deleted, the rest are upserted with their new positions. Answers already
   * collected keep a snapshot of their question's label, so an edit here never
   * corrupts an existing application.
   */
  saveQuestions: async (jobId, questions) => {
    const keepIds = questions.map(q => q.id).filter(Boolean);

    let deleteQuery = supabase.from('job_questions').delete().eq('job_id', jobId);
    if (keepIds.length) deleteQuery = deleteQuery.not('id', 'in', `(${keepIds.join(',')})`);
    const { error: deleteError } = await deleteQuery;
    if (deleteError) return { error: deleteError };

    if (!questions.length) return { error: null };

    const rows = questions.map((question, index) => ({
      ...(question.id ? { id: question.id } : {}),
      job_id: jobId,
      position: index,
      label: question.label,
      help_text: question.help_text || null,
      question_type: question.question_type,
      options: question.options || [],
      required: Boolean(question.required),
      max_length: question.max_length || null,
      is_knockout: Boolean(question.is_knockout),
      knockout_expected: question.knockout_expected || [],
      knockout_min: question.knockout_min ?? null,
      knockout_max: question.knockout_max ?? null,
      knockout_message: question.knockout_message || null,
    }));

    // Existing rows are upserted by id; brand-new ones are inserted without an
    // id at all. They cannot go in one call: a bulk request sends the union of
    // all keys, so a new row would carry `id: null` and override the default.
    const existing = rows.filter(row => row.id);
    const fresh = rows.filter(row => !row.id);

    if (existing.length) {
      const { error } = await supabase
        .from('job_questions')
        .upsert(existing, { onConflict: 'id' });
      if (error) return { error };
    }

    if (fresh.length) {
      const { error } = await supabase.from('job_questions').insert(fresh);
      if (error) return { error };
    }

    return { error: null };
  },

  applicationCounts: async () => {
    const { data, error } = await supabase.rpc('job_application_counts');
    if (error) {
      console.error('Error loading application counts:', error.message);
      return {};
    }
    return (data || []).reduce((acc, row) => {
      acc[row.job_id] = { total: Number(row.total), new: Number(row.new_count) };
      return acc;
    }, {});
  },
};

export const JobListing = JobListingAPI;
