// src/Components/Admin/JobApplicationsManager.jsx
//
// The "Applications" section of the admin dashboard.
//
// Everything here is personal information, so the component is deliberately
// conservative: resumes open through short-lived signed URLs rather than
// public links, and the detail panel is the only place full contact details
// are rendered.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Search, Download, FileText, Mail, Phone, MapPin, Link2, Github,
  Linkedin, X, Trash2, AlertCircle, RefreshCw, Star, Calendar, Globe, ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import {
  JobApplication, APPLICATION_STATUSES, applicantName, statusLabel, workRightsLabel,
} from '@/Entities/JobApplication';
import { JobListing } from '@/Entities/JobListing';
import { Pill, inputClass } from './fields';

const toneFor = (status) =>
  APPLICATION_STATUSES.find(s => s.value === status)?.tone || 'gray';

const prettyAnswer = (answer) => {
  if (answer === null || answer === undefined) return '-';
  if (typeof answer === 'boolean') return answer ? 'Yes' : 'No';
  if (Array.isArray(answer)) return answer.join(', ');
  return String(answer);
};

const fileSize = (bytes) =>
  !bytes ? '' : bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

// ── Detail panel ─────────────────────────────────────────────────────────────

const DetailRow = ({ icon: Icon, label, children }) => {
  if (!children) return null;
  return (
    <div className="flex gap-3 py-2.5 border-b border-white/5 last:border-0">
      {Icon && <Icon className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-gray-600 text-xs uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-sm text-gray-200 break-words">{children}</div>
      </div>
    </div>
  );
};

const ExternalLinkRow = ({ url, children }) =>
  url ? (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow"
      className="text-[#FF6B00] hover:underline break-all">
      {children || url}
    </a>
  ) : null;

const ApplicationDetail = ({ application, onClose, onChanged, onDeleted }) => {
  const [answers, setAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [status, setStatus] = useState(application.status);
  const [rating, setRating] = useState(application.rating || 0);
  const [notes, setNotes] = useState(application.admin_notes || '');
  const [saving, setSaving] = useState(false);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await JobApplication.getAnswers(application.id);
      if (active) { setAnswers(rows); setLoadingAnswers(false); }
    })();
    return () => { active = false; };
  }, [application.id]);

  const save = async (patch) => {
    setSaving(true);
    setError('');
    const { data, error: saveError } = await JobApplication.update(application.id, patch);
    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    onChanged(data);
  };

  // Signed URLs expire in two minutes, so one is minted per click rather than
  // held in state where it could be copied out of the page later.
  const openResume = async () => {
    setResumeBusy(true);
    setError('');
    const { url, error: urlError } = await JobApplication.resumeUrl(application.resume_path);
    setResumeBusy(false);
    if (urlError || !url) { setError('Could not open that CV. It may have been deleted.'); return; }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const remove = async () => {
    if (!window.confirm(
      `Permanently delete ${applicantName(application)}'s application?\n\n` +
      'Their CV is deleted from storage at the same time. This cannot be undone.',
    )) return;
    const { error: deleteError } = await JobApplication.remove(application);
    if (deleteError) { setError(deleteError.message); return; }
    onDeleted(application.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="relative w-full max-w-2xl h-full bg-[#111111] border-l border-white/10 overflow-y-auto"
      >
        <header className="sticky top-0 z-10 bg-[#111111]/95 backdrop-blur border-b border-white/10 px-5 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="headline-font text-2xl text-white truncate">
              {applicantName(application)}
            </h3>
            <p className="text-gray-500 text-sm truncate">
              {application.job_listings?.title || application.job_title_snapshot} &middot;{' '}
              {application.reference}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white shrink-0">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-5 space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Pipeline controls */}
          <section className="bg-[#0d0d0d] border border-white/10 rounded-xl p-4 space-y-4">
            <div>
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {APPLICATION_STATUSES.map(option => (
                  <button
                    key={option.value}
                    onClick={() => { setStatus(option.value); save({ status: option.value }); }}
                    disabled={saving}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      status === option.value
                        ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                        : 'bg-transparent border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">Rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(value => (
                  <button key={value}
                    onClick={() => {
                      const next = rating === value ? null : value;
                      setRating(next || 0);
                      save({ rating: next });
                    }}
                    className="p-1" aria-label={`Rate ${value} of 5`}>
                    <Star className={`w-5 h-5 ${
                      value <= rating ? 'text-[#FF6B00] fill-[#FF6B00]' : 'text-gray-700'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">Internal notes</p>
              <textarea
                className={`${inputClass} resize-y`} rows={3} value={notes}
                onChange={e => setNotes(e.target.value)}
                onBlur={() => notes !== (application.admin_notes || '') && save({ admin_notes: notes })}
                placeholder="Only visible to admins."
              />
            </div>
          </section>

          {/* Resume */}
          {application.resume_path ? (
            <button onClick={openResume} disabled={resumeBusy}
              className="w-full flex items-center gap-3 bg-[#0d0d0d] border border-white/10 hover:border-[#FF6B00]/40 rounded-xl p-4 text-left transition-colors disabled:opacity-60">
              {resumeBusy
                ? <Loader2 className="w-5 h-5 text-[#FF6B00] animate-spin shrink-0" />
                : <FileText className="w-5 h-5 text-[#FF6B00] shrink-0" />}
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-white truncate">
                  {application.resume_filename || 'Resume'}
                </span>
                <span className="block text-gray-600 text-xs">
                  {fileSize(application.resume_size)} &middot; opens with a 2-minute signed link
                </span>
              </span>
              <Download className="w-4 h-4 text-gray-600 shrink-0" />
            </button>
          ) : (
            <p className="text-gray-600 text-sm">No CV attached.</p>
          )}

          {/* Contact */}
          <section>
            <h4 className="headline-font text-lg text-white mb-2">Contact</h4>
            <DetailRow icon={Mail} label="Email">
              <a href={`mailto:${application.email}`} className="text-[#FF6B00] hover:underline">
                {application.email}
              </a>
            </DetailRow>
            <DetailRow icon={Phone} label="Phone">{application.phone}</DetailRow>
            <DetailRow icon={MapPin} label="Location">
              {[application.city, application.state, application.country].filter(Boolean).join(', ')}
            </DetailRow>
            <DetailRow icon={Linkedin} label="LinkedIn">
              <ExternalLinkRow url={application.linkedin_url} />
            </DetailRow>
            <DetailRow icon={Globe} label="Portfolio">
              <ExternalLinkRow url={application.portfolio_url} />
            </DetailRow>
            <DetailRow icon={Github} label="GitHub">
              <ExternalLinkRow url={application.github_url} />
            </DetailRow>
            {Array.isArray(application.other_links) && application.other_links.length > 0 && (
              <DetailRow icon={Link2} label="Other links">
                <ul className="space-y-1">
                  {application.other_links.map((link, index) => (
                    <li key={index}>
                      <ExternalLinkRow url={link.url}>{link.label || link.url}</ExternalLinkRow>
                    </li>
                  ))}
                </ul>
              </DetailRow>
            )}
          </section>

          {/* Eligibility */}
          <section>
            <h4 className="headline-font text-lg text-white mb-2">Availability</h4>
            <DetailRow icon={ShieldCheck} label="Work rights">
              {application.work_rights ? workRightsLabel(application.work_rights) : null}
            </DetailRow>
            <DetailRow label="Work rights notes">{application.work_rights_notes}</DetailRow>
            <DetailRow icon={Calendar} label="Available from">
              {application.available_from
                ? format(new Date(`${application.available_from}T00:00:00`), 'd MMM yyyy')
                : null}
            </DetailRow>
            <DetailRow label="Notice period">{application.notice_period}</DetailRow>
            <DetailRow label="Years of experience">
              {application.years_experience != null ? String(application.years_experience) : null}
            </DetailRow>
            <DetailRow label="Salary expectation">{application.salary_expectation}</DetailRow>
            <DetailRow label="How they heard about us">{application.heard_about}</DetailRow>
          </section>

          {/* Written answers */}
          {application.cover_letter && (
            <section>
              <h4 className="headline-font text-lg text-white mb-2">Cover letter</h4>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {application.cover_letter}
              </p>
            </section>
          )}

          {Array.isArray(application.projects) && application.projects.length > 0 && (
            <section>
              <h4 className="headline-font text-lg text-white mb-2">Projects</h4>
              <div className="space-y-3">
                {application.projects.map((project, index) => (
                  <div key={index} className="bg-[#0d0d0d] border border-white/10 rounded-lg p-3">
                    {project.title && <p className="text-white text-sm font-semibold">{project.title}</p>}
                    {project.url && <ExternalLinkRow url={project.url} />}
                    {project.description && (
                      <p className="text-gray-400 text-sm mt-1 whitespace-pre-wrap">{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h4 className="headline-font text-lg text-white mb-2">Screening answers</h4>
            {loadingAnswers ? (
              <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
            ) : answers.length === 0 ? (
              <p className="text-gray-600 text-sm">This role had no extra questions.</p>
            ) : (
              <div className="space-y-3">
                {answers.map(answer => (
                  <div key={answer.id} className="bg-[#0d0d0d] border border-white/10 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">{answer.question_label}</p>
                    <p className="text-sm text-gray-200 whitespace-pre-wrap">
                      {prettyAnswer(answer.answer)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {application.additional_info && (
            <section>
              <h4 className="headline-font text-lg text-white mb-2">Anything else</h4>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {application.additional_info}
              </p>
            </section>
          )}

          {/* Audit + deletion */}
          <section className="pt-2 border-t border-white/10 text-xs text-gray-600 space-y-1">
            <p>Submitted {format(new Date(application.created_at), 'd MMM yyyy, h:mm a')}</p>
            <p>
              Consent recorded {application.consent_at
                ? format(new Date(application.consent_at), 'd MMM yyyy')
                : 'n/a'} (version {application.consent_version || 'n/a'})
            </p>
            {application.delete_after && (
              <p>
                Scheduled for deletion after{' '}
                {format(new Date(`${application.delete_after}T00:00:00`), 'd MMM yyyy')}
              </p>
            )}
          </section>

          <button onClick={remove}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-4 h-4" />Delete application and CV
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
};

// ── Main section ─────────────────────────────────────────────────────────────

export default function JobApplicationsManager({ initialJobId = null, onCountChange }) {
  const [applications, setApplications] = useState([]);
  const [listings, setListings] = useState([]);
  const [jobFilter, setJobFilter] = useState(initialJobId || 'ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data, error: loadError }, { data: listingRows }] = await Promise.all([
      JobApplication.list(),
      JobListing.listAll(),
    ]);
    setApplications(data);
    setListings(listingRows);
    setError(loadError ? loadError.message : '');
    setLoading(false);
    onCountChange?.(data.length);
  }, [onCountChange]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (initialJobId) setJobFilter(initialJobId); }, [initialJobId]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applications.filter(application => {
      if (jobFilter !== 'ALL' && application.job_id !== jobFilter) return false;
      if (statusFilter !== 'ALL' && application.status !== statusFilter) return false;
      if (!term) return true;
      return [
        applicantName(application), application.email, application.reference,
        application.job_listings?.title, application.job_title_snapshot,
      ].filter(Boolean).some(value => value.toLowerCase().includes(term));
    });
  }, [applications, jobFilter, statusFilter, search]);

  const exportRows = () => {
    if (!filtered.length) return;
    const headers = [
      'Submitted', 'Reference', 'Role', 'First name', 'Last name', 'Email', 'Phone',
      'Location', 'Work rights', 'Available from', 'Notice period', 'Salary expectation',
      'Years experience', 'LinkedIn', 'Portfolio', 'GitHub', 'CV on file', 'Status', 'Rating',
    ];
    const rows = filtered.map(application => [
      format(new Date(application.created_at), 'yyyy-MM-dd HH:mm'),
      application.reference,
      application.job_listings?.title || application.job_title_snapshot,
      application.first_name, application.last_name, application.email, application.phone || '',
      [application.city, application.state, application.country].filter(Boolean).join(', '),
      application.work_rights ? workRightsLabel(application.work_rights) : '',
      application.available_from || '', application.notice_period || '',
      application.salary_expectation || '',
      application.years_experience != null ? application.years_experience : '',
      application.linkedin_url || '', application.portfolio_url || '', application.github_url || '',
      application.resume_path ? 'Yes' : 'No',
      statusLabel(application.status),
      application.rating || '',
    ]);

    const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    sheet['!cols'] = headers.map(header => ({ wch: Math.max(12, header.length + 4) }));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Applications');
    XLSX.writeFile(book, `Job_Applications_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="headline-font text-3xl text-white">Applications</h2>
          <p className="text-gray-600 text-sm mt-0.5">
            {filtered.length} of {applications.length} shown
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm hover:bg-white/5">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={exportRows} disabled={!filtered.length}
            className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-white/5 disabled:opacity-40">
            <Download className="w-4 h-4" />Excel
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#111111] px-4 py-3 mb-5 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#FF6B00] mt-0.5 shrink-0" />
        <p className="text-gray-500 text-xs leading-relaxed">
          Applicant records are personal information. Share them only with people involved in
          hiring for the role, keep exports off shared drives, and delete applications you no
          longer need - deleting a record removes its CV from storage too.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 mb-5">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input className={`${inputClass} pl-9`} value={search} placeholder="Name, email or reference"
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={`${inputClass} cursor-pointer`} value={jobFilter}
          onChange={e => setJobFilter(e.target.value)}>
          <option value="ALL">All roles</option>
          {listings.map(listing => (
            <option key={listing.id} value={listing.id} className="bg-[#1a1a1a]">
              {listing.title}
            </option>
          ))}
        </select>
        <select className={`${inputClass} cursor-pointer`} value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All statuses</option>
          {APPLICATION_STATUSES.map(option => (
            <option key={option.value} value={option.value} className="bg-[#1a1a1a]">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <FileText className="w-8 h-8 text-gray-700 mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">No applications</p>
          <p className="text-gray-600 text-sm">
            {applications.length ? 'Nothing matches those filters.' : 'They will appear here as they arrive.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-[#0d0d0d] uppercase text-xs text-gray-500 headline-font tracking-wider">
              <tr>
                {['Applicant', 'Role', 'Submitted', 'CV', 'Status', 'Rating'].map(header => (
                  <th key={header} className="px-5 py-3.5 whitespace-nowrap">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(application => (
                <tr key={application.id}
                  onClick={() => setSelected(application)}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium">{applicantName(application)}</p>
                    <p className="text-gray-600 text-xs">{application.email}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {application.job_listings?.title || application.job_title_snapshot}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                    {format(new Date(application.created_at), 'd MMM yyyy')}
                  </td>
                  <td className="px-5 py-3.5">
                    {application.resume_path
                      ? <FileText className="w-4 h-4 text-[#FF6B00]" />
                      : <span className="text-gray-700">-</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <Pill tone={toneFor(application.status)}>{statusLabel(application.status)}</Pill>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-[#FF6B00]">
                    {application.rating ? '★'.repeat(application.rating) : <span className="text-gray-700">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <ApplicationDetail
            application={selected}
            onClose={() => setSelected(null)}
            onChanged={(updated) => {
              setApplications(current =>
                current.map(item => (item.id === updated.id
                  ? { ...updated, job_listings: item.job_listings }
                  : item)));
              setSelected(current => (current ? { ...current, ...updated } : current));
            }}
            onDeleted={(id) => {
              setApplications(current => current.filter(item => item.id !== id));
              setSelected(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
