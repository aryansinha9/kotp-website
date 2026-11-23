// src/Components/Careers/JobApplicationForm.jsx
//
// The public application form for one role.
//
// It posts to the `submit-job-application` Edge Function as multipart form
// data: the anon key has no write access to the applications table or to the
// resume bucket, by design. Validation here is purely for a decent experience
// - the function re-checks everything, and it is the function's answer that
// decides whether an application exists.

import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload, X, Loader2, CheckCircle, AlertCircle, Plus, Trash2, FileText, Lock,
} from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { WORK_RIGHTS_OPTIONS } from '@/Entities/JobApplication';

const CONSENT_VERSION = '2026-11-23';
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['pdf', 'doc', 'docx', 'rtf', 'txt'];
const ACCEPT_ATTRIBUTE = '.pdf,.doc,.docx,.rtf,.txt';

const field =
  'w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm ' +
  'placeholder:text-gray-600 focus:border-[#FF6B00] focus:outline-none transition-colors';

const Label = ({ children, required }) => (
  <label className="block text-white mb-2 headline-font text-sm tracking-wide">
    {children}{required && <span className="text-[#FF6B00] ml-1">*</span>}
  </label>
);

const Group = ({ title, children }) => (
  <fieldset className="space-y-5">
    <legend className="headline-font text-2xl text-white mb-1">{title}</legend>
    {children}
  </fieldset>
);

// ── Dynamic questionnaire ────────────────────────────────────────────────────

const QuestionField = ({ question, value, onChange }) => {
  const options = Array.isArray(question.options) ? question.options : [];

  switch (question.question_type) {
    case 'long_text':
      return (
        <textarea className={`${field} min-h-[120px] resize-y`} rows={4}
          maxLength={question.max_length || 5000} value={value ?? ''}
          onChange={e => onChange(e.target.value)} />
      );

    case 'boolean':
      return (
        <div className="flex gap-3">
          {[['true', 'Yes'], ['false', 'No']].map(([optionValue, label]) => (
            <button key={optionValue} type="button"
              onClick={() => onChange(value === optionValue ? null : optionValue)}
              className={`px-5 py-2.5 rounded-lg text-sm border transition-colors ${
                value === optionValue
                  ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                  : 'bg-[#0a0a0a] border-white/10 text-gray-400 hover:text-white'
              }`}>
              {label}
            </button>
          ))}
        </div>
      );

    case 'single_select':
      return (
        <div className="flex flex-wrap gap-2">
          {options.map(option => (
            <button key={option} type="button"
              onClick={() => onChange(value === option ? null : option)}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                value === option
                  ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                  : 'bg-[#0a0a0a] border-white/10 text-gray-400 hover:text-white'
              }`}>
              {option}
            </button>
          ))}
        </div>
      );

    case 'multi_select': {
      const picked = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-wrap gap-2">
          {options.map(option => (
            <button key={option} type="button"
              onClick={() => onChange(picked.includes(option)
                ? picked.filter(item => item !== option)
                : [...picked, option])}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                picked.includes(option)
                  ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                  : 'bg-[#0a0a0a] border-white/10 text-gray-400 hover:text-white'
              }`}>
              {option}
            </button>
          ))}
        </div>
      );
    }

    case 'number':
      return (
        <input type="number" className={field} value={value ?? ''}
          onChange={e => onChange(e.target.value)} />
      );

    case 'date':
      return (
        <input type="date" className={field} value={value ?? ''}
          onChange={e => onChange(e.target.value)} />
      );

    case 'url':
      return (
        <input type="url" className={field} placeholder="https://" value={value ?? ''}
          onChange={e => onChange(e.target.value)} />
      );

    default:
      return (
        <input type="text" className={field} maxLength={question.max_length || 200}
          value={value ?? ''} onChange={e => onChange(e.target.value)} />
      );
  }
};

// ── Repeatable groups ────────────────────────────────────────────────────────

const RepeatableLinks = ({ links, onChange }) => (
  <div className="space-y-3">
    {links.map((link, index) => (
      <div key={index} className="flex flex-col sm:flex-row gap-2">
        <input className={`${field} sm:w-48`} placeholder="Label (e.g. Dribbble)"
          value={link.label}
          onChange={e => onChange(links.map((item, i) =>
            (i === index ? { ...item, label: e.target.value } : item)))} />
        <input className={field} placeholder="https://" value={link.url}
          onChange={e => onChange(links.map((item, i) =>
            (i === index ? { ...item, url: e.target.value } : item)))} />
        <button type="button" onClick={() => onChange(links.filter((_, i) => i !== index))}
          className="p-3 text-gray-600 hover:text-red-400 self-start" aria-label="Remove link">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ))}
    {links.length < 8 && (
      <button type="button" onClick={() => onChange([...links, { label: '', url: '' }])}
        className="flex items-center gap-1.5 text-sm text-[#FF6B00] hover:text-[#FF8C00]">
        <Plus className="w-4 h-4" />Add another link
      </button>
    )}
  </div>
);

const RepeatableProjects = ({ projects, onChange }) => (
  <div className="space-y-4">
    {projects.map((project, index) => (
      <div key={index} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-2">
          <input className={field} placeholder="Project name" value={project.title}
            onChange={e => onChange(projects.map((item, i) =>
              (i === index ? { ...item, title: e.target.value } : item)))} />
          <button type="button" onClick={() => onChange(projects.filter((_, i) => i !== index))}
            className="p-3 text-gray-600 hover:text-red-400" aria-label="Remove project">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <input className={field} placeholder="https:// (optional)" value={project.url}
          onChange={e => onChange(projects.map((item, i) =>
            (i === index ? { ...item, url: e.target.value } : item)))} />
        <textarea className={`${field} min-h-[80px] resize-y`} rows={3}
          placeholder="What it is, and what you did on it" value={project.description}
          onChange={e => onChange(projects.map((item, i) =>
            (i === index ? { ...item, description: e.target.value } : item)))} />
      </div>
    ))}
    {projects.length < 10 && (
      <button type="button"
        onClick={() => onChange([...projects, { title: '', url: '', description: '' }])}
        className="flex items-center gap-1.5 text-sm text-[#FF6B00] hover:text-[#FF8C00]">
        <Plus className="w-4 h-4" />Add a project
      </button>
    )}
  </div>
);

// ── Main form ────────────────────────────────────────────────────────────────

export default function JobApplicationForm({ listing }) {
  const fileInputRef = useRef(null);
  const questions = useMemo(() => listing.questions || [], [listing.questions]);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    city: '', state: '', country: 'Australia',
    workRights: '', workRightsNotes: '',
    availableFrom: '', noticePeriod: '', salaryExpectation: '', yearsExperience: '',
    linkedinUrl: '', portfolioUrl: '', githubUrl: '',
    coverLetter: '', additionalInfo: '', heardAbout: '',
    honeypot: '',
  });
  const [otherLinks, setOtherLinks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [answers, setAnswers] = useState({});
  const [resume, setResume] = useState(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState(null);

  const set = (key) => (value) => setForm(current => ({ ...current, [key]: value }));

  const pickFile = (file) => {
    setError('');
    if (!file) { setResume(null); return; }

    const extension = (file.name.split('.').pop() || '').toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setError('Please upload your CV as a PDF, DOC, DOCX, RTF or TXT file.');
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setError('Your CV must be 5 MB or smaller.');
      return;
    }
    setResume(file);
  };

  const validate = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return 'Please give your first and last name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Please give a valid email address.';
    if (listing.requires_resume && !resume) return 'This role needs a resume or CV.';
    if (!consent) return 'Please confirm you agree to KOTP handling your application.';

    for (const question of questions) {
      if (!question.required) continue;
      const answer = answers[question.id];
      const empty = answer === undefined || answer === null || answer === '' ||
        (Array.isArray(answer) && answer.length === 0);
      if (empty) return `Please answer: ${question.label}`;
    }
    return '';
  };

  /** The function answers with a plain-language `message`; surface it as-is. */
  const readFunctionError = async (invokeError, data) => {
    if (data?.message) return data.message;
    try {
      const body = await invokeError?.context?.json?.();
      if (body?.message) return body.message;
    } catch { /* fall through to the generic message */ }
    return 'We could not submit your application. Please try again in a moment.';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      jobId: listing.id,
      ...form,
      otherLinks: listing.allow_links === false ? [] : otherLinks.filter(link => link.url.trim()),
      projects: listing.allow_projects === false
        ? []
        : projects.filter(project => project.title.trim() || project.url.trim() || project.description.trim()),
      answers,
      consentGiven: true,
      consentVersion: CONSENT_VERSION,
    };

    const body = new FormData();
    body.append('payload', JSON.stringify(payload));
    if (resume) body.append('resume', resume, resume.name);

    const { data, error: invokeError } = await supabase.functions.invoke(
      'submit-job-application', { body },
    );

    if (invokeError || !data?.ok) {
      setError(await readFunctionError(invokeError, data));
      setSubmitting(false);
      return;
    }

    setReference(data.reference);
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Success ──
  if (reference) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a1a] border border-[#FF6B00]/30 rounded-2xl p-8 md:p-12 text-center"
      >
        <CheckCircle className="w-14 h-14 text-[#FF6B00] mx-auto mb-5" />
        <h3 className="headline-font text-3xl text-white mb-3">APPLICATION RECEIVED</h3>
        <p className="text-gray-400 mb-6 max-w-lg mx-auto">
          Thanks for applying for <span className="text-white">{listing.title}</span>. We have
          emailed a confirmation to {form.email}. Our team reviews every application and will be
          in touch if your experience lines up with the role.
        </p>
        <div className="inline-block bg-[#0a0a0a] border border-white/10 rounded-xl px-6 py-4 mb-6">
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-1">Your reference</p>
          <p className="headline-font text-2xl text-[#FF6B00]">{reference}</p>
        </div>
        <p className="text-gray-600 text-sm">
          Quote it in any follow-up. To access, correct or delete the information you sent us,
          email {listing.contact_email || 'kotp.football@gmail.com'}.
        </p>
      </motion.div>
    );
  }

  // ── Form ──
  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Leave this field empty
          <input type="text" tabIndex={-1} autoComplete="off" value={form.honeypot}
            onChange={e => set('honeypot')(e.target.value)} />
        </label>
      </div>

      <Group title="ABOUT YOU">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label required>First name</Label>
            <input className={field} value={form.firstName} maxLength={80} autoComplete="given-name"
              onChange={e => set('firstName')(e.target.value)} />
          </div>
          <div>
            <Label required>Last name</Label>
            <input className={field} value={form.lastName} maxLength={80} autoComplete="family-name"
              onChange={e => set('lastName')(e.target.value)} />
          </div>
          <div>
            <Label required>Email</Label>
            <input type="email" className={field} value={form.email} maxLength={254} autoComplete="email"
              onChange={e => set('email')(e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <input type="tel" className={field} value={form.phone} maxLength={40} autoComplete="tel"
              onChange={e => set('phone')(e.target.value)} />
          </div>
          <div>
            <Label>Suburb / city</Label>
            <input className={field} value={form.city} maxLength={120}
              onChange={e => set('city')(e.target.value)} />
          </div>
          <div>
            <Label>State</Label>
            <input className={field} value={form.state} maxLength={120}
              onChange={e => set('state')(e.target.value)} />
          </div>
        </div>
      </Group>

      <Group title="YOUR CV">
        <div>
          <Label required={listing.requires_resume}>Resume / CV</Label>
          {resume ? (
            <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#FF6B00]/30 rounded-lg px-4 py-3">
              <FileText className="w-5 h-5 text-[#FF6B00] shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-white text-sm truncate">{resume.name}</span>
                <span className="block text-gray-600 text-xs">
                  {(resume.size / 1024).toFixed(0)} KB
                </span>
              </span>
              <button type="button"
                onClick={() => { setResume(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="p-1.5 text-gray-500 hover:text-red-400" aria-label="Remove file">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-white/15 rounded-lg py-8 cursor-pointer hover:border-[#FF6B00]/50 transition-colors">
              <Upload className="w-6 h-6 text-gray-600" />
              <span className="text-sm text-gray-400">Choose a file</span>
              <span className="text-xs text-gray-600">PDF, DOC, DOCX, RTF or TXT &middot; up to 5 MB</span>
              <input ref={fileInputRef} type="file" className="hidden" accept={ACCEPT_ATTRIBUTE}
                onChange={e => pickFile(e.target.files?.[0] || null)} />
            </label>
          )}
        </div>

        {listing.allow_cover_letter !== false && (
          <div>
            <Label>Cover letter</Label>
            <textarea className={`${field} min-h-[180px] resize-y`} rows={7} maxLength={8000}
              placeholder="Why this role, and why you."
              value={form.coverLetter} onChange={e => set('coverLetter')(e.target.value)} />
          </div>
        )}
      </Group>

      {listing.allow_links !== false && (
        <Group title="LINKS">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label>LinkedIn</Label>
              <input className={field} placeholder="linkedin.com/in/..." value={form.linkedinUrl}
                onChange={e => set('linkedinUrl')(e.target.value)} />
            </div>
            <div>
              <Label>Portfolio / website</Label>
              <input className={field} placeholder="https://" value={form.portfolioUrl}
                onChange={e => set('portfolioUrl')(e.target.value)} />
            </div>
            <div>
              <Label>GitHub</Label>
              <input className={field} placeholder="github.com/..." value={form.githubUrl}
                onChange={e => set('githubUrl')(e.target.value)} />
            </div>
          </div>
          <RepeatableLinks links={otherLinks} onChange={setOtherLinks} />
        </Group>
      )}

      {listing.allow_projects !== false && (
        <Group title="PROJECTS">
          <p className="text-gray-500 text-sm -mt-3">
            Anything you have built, run or played a real part in. Optional.
          </p>
          <RepeatableProjects projects={projects} onChange={setProjects} />
        </Group>
      )}

      <Group title="AVAILABILITY">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label>Right to work in Australia</Label>
            <select className={`${field} cursor-pointer`} value={form.workRights}
              onChange={e => set('workRights')(e.target.value)}>
              <option value="">Prefer not to say</option>
              {WORK_RIGHTS_OPTIONS.map(option => (
                <option key={option.value} value={option.value} className="bg-[#1a1a1a]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Available from</Label>
            <input type="date" className={field} value={form.availableFrom}
              onChange={e => set('availableFrom')(e.target.value)} />
          </div>
          <div>
            <Label>Notice period</Label>
            <input className={field} maxLength={200} placeholder="e.g. 2 weeks"
              value={form.noticePeriod} onChange={e => set('noticePeriod')(e.target.value)} />
          </div>
          <div>
            <Label>Years of relevant experience</Label>
            <input type="number" min="0" max="70" step="0.5" className={field}
              value={form.yearsExperience} onChange={e => set('yearsExperience')(e.target.value)} />
          </div>
          <div>
            <Label>Pay expectation</Label>
            <input className={field} maxLength={200} placeholder="Optional"
              value={form.salaryExpectation} onChange={e => set('salaryExpectation')(e.target.value)} />
          </div>
          <div>
            <Label>How did you hear about this role?</Label>
            <input className={field} maxLength={200}
              value={form.heardAbout} onChange={e => set('heardAbout')(e.target.value)} />
          </div>
        </div>
        {form.workRights && form.workRights !== 'citizen' && form.workRights !== 'permanent_resident' && (
          <div>
            <Label>Anything we should know about your work rights?</Label>
            <textarea className={`${field} min-h-[80px] resize-y`} rows={3} maxLength={2000}
              value={form.workRightsNotes} onChange={e => set('workRightsNotes')(e.target.value)} />
          </div>
        )}
      </Group>

      {questions.length > 0 && (
        <Group title="A FEW QUESTIONS">
          <div className="space-y-6">
            {questions.map(question => (
              <div key={question.id}>
                <Label required={question.required}>{question.label}</Label>
                {question.help_text && (
                  <p className="text-gray-500 text-xs mb-2 -mt-1">{question.help_text}</p>
                )}
                <QuestionField
                  question={question}
                  value={answers[question.id]}
                  onChange={value => setAnswers(current => ({ ...current, [question.id]: value }))}
                />
              </div>
            ))}
          </div>
        </Group>
      )}

      <Group title="ANYTHING ELSE">
        <div>
          <Label>Is there anything else you would like us to know?</Label>
          <textarea className={`${field} min-h-[120px] resize-y`} rows={5} maxLength={8000}
            value={form.additionalInfo} onChange={e => set('additionalInfo')(e.target.value)} />
        </div>
      </Group>

      {/* Consent */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-[#0a0a0a] accent-[#FF6B00] cursor-pointer" />
          <span className="text-sm text-gray-400 leading-relaxed">
            I agree to King of the Pitch collecting and storing the information and files in this
            form to assess my application for this role, and for related recruitment. I understand
            I can ask for my information to be accessed, corrected or deleted at any time, and
            I have read the{' '}
            <Link to="/privacy-policy" target="_blank"
              className="text-[#FF6B00] hover:underline">privacy policy</Link>.
            <span className="text-[#FF6B00] ml-1">*</span>
          </span>
        </label>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <button type="submit" disabled={submitting}
          className="w-full kotp-button bg-[#FF6B00] text-white py-5 rounded-lg headline-font text-lg tracking-wider hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
          {submitting
            ? <><Loader2 className="w-5 h-5 animate-spin" />SUBMITTING...</>
            : 'SUBMIT APPLICATION'}
        </button>
        <p className="text-gray-600 text-xs flex items-center justify-center gap-1.5 text-center">
          <Lock className="w-3 h-3 shrink-0" />
          Your application and CV are stored privately and are visible only to KOTP hiring admins.
        </p>
      </div>
    </form>
  );
}
