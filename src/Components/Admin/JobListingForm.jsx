// src/Components/Admin/JobListingForm.jsx
//
// Create / edit screen for a single job listing, including its screening
// questionnaire. Everything an applicant sees on the public page is set here.

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Save, AlertCircle, ExternalLink } from 'lucide-react';
import {
  EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, LISTING_STATUSES, WORKPLACE_TYPES,
  JobListing, slugify,
} from '@/Entities/JobListing';
import {
  AreaField, Field, ListField, Section, SelectField, TextField, ToggleField, inputClass,
} from './fields';
import QuestionnaireBuilder from './QuestionnaireBuilder';

const EMPTY_LISTING = {
  title: '',
  slug: '',
  department: '',
  location: '',
  workplace_type: 'on_site',
  employment_type: 'full_time',
  experience_level: null,
  summary: '',
  description: '',
  responsibilities: [],
  requirements: [],
  qualifications: [],
  benefits: [],
  skills: [],
  about_team: '',
  how_to_apply: '',
  salary_min: null,
  salary_max: null,
  salary_currency: 'AUD',
  salary_period: 'year',
  salary_visible: false,
  status: 'draft',
  openings: 1,
  application_deadline: null,
  sort_order: 0,
  contact_email: '',
  requires_resume: true,
  allow_cover_letter: true,
  allow_projects: true,
  allow_links: true,
};

const SALARY_PERIODS = [
  { value: 'hour', label: 'Per hour' },
  { value: 'day', label: 'Per day' },
  { value: 'week', label: 'Per week' },
  { value: 'month', label: 'Per month' },
  { value: 'year', label: 'Per year' },
  { value: 'project', label: 'Per project' },
];

/** Strips empty bullet rows and normalises the shape the DB expects. */
const cleanList = (items) =>
  (Array.isArray(items) ? items : []).map(item => String(item).trim()).filter(Boolean);

export default function JobListingForm({ listing, onDone, onCancel }) {
  const isNew = !listing?.id;
  const [form, setForm] = useState(() => ({ ...EMPTY_LISTING, ...(listing || {}) }));
  const [questions, setQuestions] = useState([]);
  const [slugTouched, setSlugTouched] = useState(Boolean(listing?.slug));
  const [loadingQuestions, setLoadingQuestions] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    let active = true;
    (async () => {
      const { data } = await JobListing.getQuestions(listing.id);
      if (active) { setQuestions(data); setLoadingQuestions(false); }
    })();
    return () => { active = false; };
  }, [isNew, listing?.id]);

  const set = (key) => (value) => setForm(current => ({ ...current, [key]: value }));

  // The slug follows the title until an admin edits it by hand; after that it
  // is left alone, because changing it would break any shared link.
  const slug = useMemo(
    () => (slugTouched ? form.slug : slugify(form.title)),
    [slugTouched, form.slug, form.title],
  );

  const validate = () => {
    if (!form.title.trim()) return 'Give the role a title.';
    if (!slug) return 'The role needs a URL slug.';
    if (form.salary_visible && form.salary_min == null && form.salary_max == null) {
      return 'Add a salary range, or switch off "show salary".';
    }
    if (form.salary_min != null && form.salary_max != null &&
        Number(form.salary_max) < Number(form.salary_min)) {
      return 'The maximum salary cannot be below the minimum.';
    }
    for (const [index, question] of questions.entries()) {
      if (!question.label?.trim()) return `Question ${index + 1} needs a label.`;
      if (['single_select', 'multi_select'].includes(question.question_type) &&
          cleanList(question.options).length < 1) {
        return `Question ${index + 1} needs at least one option.`;
      }
      if (question.is_knockout) {
        const hasAccepted = cleanList(question.knockout_expected).length > 0;
        const hasBounds = question.knockout_min != null || question.knockout_max != null;
        if (question.question_type === 'number' ? !hasBounds && !hasAccepted : !hasAccepted) {
          return `Question ${index + 1} is a screening requirement but has no accepted answer.`;
        }
      }
    }
    return '';
  };

  const handleSave = async (statusOverride) => {
    const problem = validate();
    if (problem) { setError(problem); return; }

    setSaving(true);
    setError('');

    const payload = {
      ...form,
      slug,
      title: form.title.trim(),
      status: statusOverride || form.status,
      summary: form.summary?.trim() || null,
      description: form.description || '',
      department: form.department?.trim() || null,
      location: form.location?.trim() || null,
      contact_email: form.contact_email?.trim() || null,
      about_team: form.about_team?.trim() || null,
      how_to_apply: form.how_to_apply?.trim() || null,
      responsibilities: cleanList(form.responsibilities),
      requirements: cleanList(form.requirements),
      qualifications: cleanList(form.qualifications),
      benefits: cleanList(form.benefits),
      skills: cleanList(form.skills),
      openings: Number(form.openings) || 1,
      sort_order: Number(form.sort_order) || 0,
      salary_min: form.salary_min === '' ? null : form.salary_min,
      salary_max: form.salary_max === '' ? null : form.salary_max,
      application_deadline: form.application_deadline || null,
    };

    // Columns the DB owns; sending them back would be rejected or ignored.
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;
    delete payload.created_by;
    delete payload.published_at;

    const { data, error: saveError } = isNew
      ? await JobListing.create(payload)
      : await JobListing.update(listing.id, payload);

    if (saveError) {
      setSaving(false);
      setError(
        saveError.code === '23505'
          ? 'Another listing already uses that URL slug. Pick a different one.'
          : saveError.message,
      );
      return;
    }

    const cleanedQuestions = questions
      .filter(question => question.label?.trim())
      .map(question => ({
        ...question,
        label: question.label.trim(),
        options: cleanList(question.options),
        knockout_expected: cleanList(question.knockout_expected),
      }));

    const { error: questionsError } = await JobListing.saveQuestions(data.id, cleanedQuestions);
    setSaving(false);

    if (questionsError) {
      setError(`The role was saved, but its questions were not: ${questionsError.message}`);
      return;
    }
    onDone(data);
  };

  return (
    <div className="space-y-6 pb-4">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onCancel}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to listings
        </button>

        <div className="flex items-center gap-2">
          {!isNew && listing.status === 'open' && (
            <a href={`/careers/${listing.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#FF6B00] px-3 py-2">
              <ExternalLink className="w-3.5 h-3.5" />View live
            </a>
          )}
          <button onClick={() => handleSave()} disabled={saving}
            className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-white/5 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
          {form.status !== 'open' && (
            <button onClick={() => handleSave('open')} disabled={saving}
              className="bg-[#FF6B00] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#FF6B00]/90 disabled:opacity-50">
              Save &amp; publish
            </button>
          )}
        </div>
      </div>

      <h2 className="headline-font text-3xl text-white">
        {isNew ? 'New role' : form.title || 'Edit role'}
      </h2>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* ── The basics ── */}
      <Section title="The basics" description="What the role is and where it sits.">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Job title" required value={form.title}
              onChange={value => setForm(c => ({ ...c, title: value }))}
              placeholder="Academy Coach" />
            <Field label="URL slug" hint={`Public page: /careers/${slug || '...'}`}>
              <input className={inputClass} value={slug}
                onChange={e => { setSlugTouched(true); setForm(c => ({ ...c, slug: slugify(e.target.value) })); }}
                placeholder="academy-coach" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Department / team" value={form.department}
              onChange={set('department')} placeholder="Academy" />
            <TextField label="Location" value={form.location}
              onChange={set('location')} placeholder="Sydney, NSW" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="Employment type" value={form.employment_type}
              options={EMPLOYMENT_TYPES} onChange={set('employment_type')} />
            <SelectField label="Workplace" value={form.workplace_type}
              options={WORKPLACE_TYPES} onChange={set('workplace_type')} />
            <SelectField label="Experience level" value={form.experience_level}
              options={EXPERIENCE_LEVELS} onChange={set('experience_level')}
              placeholder="Not specified" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SelectField label="Status" value={form.status}
              options={LISTING_STATUSES} onChange={set('status')} />
            <Field label="Openings">
              <input type="number" min="1" className={inputClass} value={form.openings}
                onChange={e => set('openings')(e.target.value)} />
            </Field>
            <Field label="Applications close" hint="Optional.">
              <input type="date" className={inputClass} value={form.application_deadline || ''}
                onChange={e => set('application_deadline')(e.target.value || null)} />
            </Field>
            <Field label="Sort order" hint="Lower shows first.">
              <input type="number" className={inputClass} value={form.sort_order}
                onChange={e => set('sort_order')(e.target.value)} />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Description ── */}
      <Section title="Role description" description="The long-form content on the public page.">
        <div className="space-y-4">
          <AreaField label="Summary" rows={2} value={form.summary} onChange={set('summary')}
            hint="One or two lines, shown on the careers listing card."
            placeholder="Lead weekly academy sessions for our U9-U14 squads in Sydney's north-west." />
          <AreaField label="About the role" rows={7} value={form.description} onChange={set('description')}
            hint="Paragraphs are preserved. Plain text - no HTML."
            placeholder="Describe the role, who it reports to, and what a typical week looks like." />
          <AreaField label="About the team" rows={4} value={form.about_team} onChange={set('about_team')} />
          <ListField label="Responsibilities" items={form.responsibilities}
            onChange={set('responsibilities')} placeholder="Run two training sessions a week"
            addLabel="Add responsibility" />
          <ListField label="Requirements" items={form.requirements}
            onChange={set('requirements')} placeholder="2+ years coaching junior football"
            addLabel="Add requirement" />
          <ListField label="Qualifications" items={form.qualifications}
            onChange={set('qualifications')} placeholder="FA/AFC C Licence or equivalent"
            addLabel="Add qualification" />
          <ListField label="Skills" items={form.skills}
            onChange={set('skills')} placeholder="Session planning" addLabel="Add skill" />
          <ListField label="What we offer" items={form.benefits}
            onChange={set('benefits')} placeholder="Paid coaching development" addLabel="Add benefit" />
          <AreaField label="How to apply / extra notes" rows={3}
            value={form.how_to_apply} onChange={set('how_to_apply')} />
        </div>
      </Section>

      {/* ── Compensation ── */}
      <Section title="Compensation" description="Shown publicly only when you switch it on.">
        <div className="space-y-4">
          <ToggleField label="Show the pay range on the public listing"
            checked={form.salary_visible} onChange={set('salary_visible')} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Minimum">
              <input type="number" min="0" step="0.01" className={inputClass}
                value={form.salary_min ?? ''}
                onChange={e => set('salary_min')(e.target.value === '' ? null : e.target.value)} />
            </Field>
            <Field label="Maximum">
              <input type="number" min="0" step="0.01" className={inputClass}
                value={form.salary_max ?? ''}
                onChange={e => set('salary_max')(e.target.value === '' ? null : e.target.value)} />
            </Field>
            <TextField label="Currency" value={form.salary_currency}
              onChange={set('salary_currency')} maxLength={3} />
            <SelectField label="Period" value={form.salary_period}
              options={SALARY_PERIODS} onChange={set('salary_period')} />
          </div>
        </div>
      </Section>

      {/* ── Application settings ── */}
      <Section title="Application form"
        description="Which parts of the standard form applicants for this role will see.">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <ToggleField label="Require a resume / CV"
              hint="PDF, DOC, DOCX, RTF or TXT, up to 5 MB."
              checked={form.requires_resume} onChange={set('requires_resume')} />
            <ToggleField label="Ask for a cover letter"
              checked={form.allow_cover_letter} onChange={set('allow_cover_letter')} />
            <ToggleField label="Ask for links (LinkedIn, portfolio, GitHub)"
              checked={form.allow_links} onChange={set('allow_links')} />
            <ToggleField label="Ask for projects"
              checked={form.allow_projects} onChange={set('allow_projects')} />
          </div>
          <TextField label="Contact email for applicants" type="email"
            value={form.contact_email} onChange={set('contact_email')}
            hint="Shown on the listing and used as the privacy contact in the acknowledgement email."
            placeholder="careers@kingofthepitch.com.au" />
        </div>
      </Section>

      {/* ── Questionnaire ── */}
      <Section title="Screening questions"
        description="Extra questions for this role. Mark one as a screening requirement to refuse applications that do not meet it.">
        {loadingQuestions
          ? <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />Loading questions...
            </div>
          : <QuestionnaireBuilder questions={questions} onChange={setQuestions} />}
      </Section>

      {/* ── Footer actions ── */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2.5 text-sm text-gray-400 hover:text-white">
          Cancel
        </button>
        <button onClick={() => handleSave()} disabled={saving}
          className="flex items-center gap-2 bg-[#FF6B00] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#FF6B00]/90 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isNew ? 'Create role' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
