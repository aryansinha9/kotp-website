// src/Entities/JobApplication.js
//
// Admin-only data access for job applications.
//
// Applications are written solely by the `submit-job-application` Edge
// Function; there is no client insert path, by design. Everything here runs
// against RLS policies that require membership of public.job_admins, so a
// non-admin session gets an empty result rather than a leak.

import { supabase } from '@/supabaseClient';

const RESUME_BUCKET = 'job-applications';

export const APPLICATION_STATUSES = [
  { value: 'new', label: 'New', tone: 'blue' },
  { value: 'in_review', label: 'In review', tone: 'amber' },
  { value: 'shortlisted', label: 'Shortlisted', tone: 'orange' },
  { value: 'interviewing', label: 'Interviewing', tone: 'purple' },
  { value: 'offer', label: 'Offer', tone: 'teal' },
  { value: 'hired', label: 'Hired', tone: 'green' },
  { value: 'rejected', label: 'Not progressing', tone: 'red' },
  { value: 'withdrawn', label: 'Withdrawn', tone: 'gray' },
];

export const WORK_RIGHTS_OPTIONS = [
  { value: 'citizen', label: 'Australian citizen' },
  { value: 'permanent_resident', label: 'Permanent resident' },
  { value: 'visa_with_work_rights', label: 'Visa with full work rights' },
  { value: 'student_visa', label: 'Student visa (limited hours)' },
  { value: 'requires_sponsorship', label: 'Would need sponsorship' },
  { value: 'other', label: 'Other / prefer to explain' },
];

export const statusLabel = (value) =>
  APPLICATION_STATUSES.find(s => s.value === value)?.label || value || '';

export const workRightsLabel = (value) =>
  WORK_RIGHTS_OPTIONS.find(s => s.value === value)?.label || value || '';

export const applicantName = (application) =>
  `${application?.first_name || ''} ${application?.last_name || ''}`.trim();

const JobApplicationAPI = {
  /** All applications, newest first, with the listing title for grouping. */
  list: async ({ jobId = null, status = null } = {}) => {
    let query = supabase
      .from('job_applications')
      .select('*, job_listings(id, title, slug)')
      .order('created_at', { ascending: false });

    if (jobId) query = query.eq('job_id', jobId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      console.error('Error loading applications:', error.message);
      return { data: [], error };
    }
    return { data: data || [], error: null };
  },

  /** Questionnaire answers for one application, in the order they were asked. */
  getAnswers: async (applicationId) => {
    const { data, error } = await supabase
      .from('job_application_answers')
      .select('*')
      .eq('application_id', applicationId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error loading answers:', error.message);
      return [];
    }
    return data || [];
  },

  /** Records who reviewed it alongside the change, for an audit trail. */
  update: async (id, patch) => {
    const { data: { user } } = await supabase.auth.getUser();
    return supabase
      .from('job_applications')
      .update({
        ...patch,
        reviewed_by: user?.id ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
  },

  /**
   * Short-lived signed URL for a CV. The bucket is private and has no public
   * read path, so this is the only way to open one - and the link expires.
   */
  resumeUrl: async (path, expiresInSeconds = 120) => {
    if (!path) return { url: null, error: new Error('No resume on file') };
    const { data, error } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(path, expiresInSeconds, { download: true });

    if (error) {
      console.error('Error signing resume URL:', error.message);
      return { url: null, error };
    }
    return { url: data?.signedUrl ?? null, error: null };
  },

  /** Deletes the record and its stored CV together: no orphaned files. */
  remove: async (application) => {
    if (application?.resume_path) {
      const { error: storageError } = await supabase.storage
        .from(RESUME_BUCKET)
        .remove([application.resume_path]);
      // A missing object should not block deleting the record it belongs to.
      if (storageError) console.error('Error removing resume:', storageError.message);
    }
    return supabase.from('job_applications').delete().eq('id', application.id);
  },
};

export const JobApplication = JobApplicationAPI;
