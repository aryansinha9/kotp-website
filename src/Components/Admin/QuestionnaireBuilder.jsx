// src/Components/Admin/QuestionnaireBuilder.jsx
//
// Builds the per-listing screening questionnaire.
//
// A question can optionally be a "knock-out": the Edge Function refuses an
// application whose answer is not acceptable, and stores nothing at all. The
// accepted answers configured here never reach the browser of an applicant -
// the public form reads the `open_job_questions` view, which omits them.

import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, ShieldAlert, GripVertical } from 'lucide-react';
import { QUESTION_TYPES } from '@/Entities/JobListing';
import { Field, ListField, SelectField, TextField, ToggleField, inputClass } from './fields';

const CHOICE_TYPES = new Set(['single_select', 'multi_select']);
const TEXTUAL_TYPES = new Set(['short_text', 'long_text', 'url', 'date']);

const blankQuestion = () => ({
  id: null,
  label: '',
  help_text: '',
  question_type: 'short_text',
  options: [],
  required: false,
  max_length: null,
  is_knockout: false,
  knockout_expected: [],
  knockout_min: null,
  knockout_max: null,
  knockout_message: '',
});

/** Which answers count as "acceptable" for the current question type. */
const KnockoutEditor = ({ question, onChange }) => {
  const type = question.question_type;
  const accepted = Array.isArray(question.knockout_expected) ? question.knockout_expected : [];

  const toggleAccepted = (value) => {
    const next = accepted.includes(value)
      ? accepted.filter(item => item !== value)
      : [...accepted, value];
    onChange({ ...question, knockout_expected: next });
  };

  return (
    <div className="mt-4 rounded-lg border border-[#FF6B00]/20 bg-[#FF6B00]/5 p-4 space-y-4">
      <p className="text-xs text-[#FF6B00] flex items-center gap-2 font-medium">
        <ShieldAlert className="w-3.5 h-3.5" />
        Screening requirement - applications that do not meet it are refused and never stored.
      </p>

      {type === 'boolean' && (
        <Field label="Accepted answer">
          <div className="flex gap-2">
            {['true', 'false'].map(value => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ ...question, knockout_expected: [value] })}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  accepted.includes(value)
                    ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                    : 'bg-[#0a0a0a] border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {value === 'true' ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </Field>
      )}

      {CHOICE_TYPES.has(type) && (
        <Field
          label="Accepted options"
          hint={type === 'multi_select'
            ? 'The applicant passes when at least one of their selections is ticked here.'
            : 'Tick every option that should be allowed through.'}
        >
          {question.options?.length ? (
            <div className="flex flex-wrap gap-2">
              {question.options.filter(Boolean).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleAccepted(option)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    accepted.includes(option)
                      ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                      : 'bg-[#0a0a0a] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-xs">Add some options above first.</p>
          )}
        </Field>
      )}

      {type === 'number' && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Minimum" hint="Leave blank for no lower bound.">
            <input
              type="number" className={inputClass} value={question.knockout_min ?? ''}
              onChange={e => onChange({
                ...question,
                knockout_min: e.target.value === '' ? null : Number(e.target.value),
              })}
            />
          </Field>
          <Field label="Maximum" hint="Leave blank for no upper bound.">
            <input
              type="number" className={inputClass} value={question.knockout_max ?? ''}
              onChange={e => onChange({
                ...question,
                knockout_max: e.target.value === '' ? null : Number(e.target.value),
              })}
            />
          </Field>
        </div>
      )}

      {TEXTUAL_TYPES.has(type) && (
        <ListField
          label="Accepted answers"
          hint="Matched exactly, ignoring case and surrounding spaces."
          items={accepted}
          onChange={value => onChange({ ...question, knockout_expected: value })}
          placeholder="e.g. Yes"
          addLabel="Add accepted answer"
        />
      )}

      <TextField
        label="Message shown when it is not met"
        hint="Keep it factual and polite - the applicant sees this instead of a confirmation."
        value={question.knockout_message}
        onChange={value => onChange({ ...question, knockout_message: value })}
        placeholder="This role requires a current NSW Working with Children Check."
      />
    </div>
  );
};

const QuestionCard = ({ question, index, total, onChange, onRemove, onMove }) => (
  <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4 md:p-5">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-2 text-gray-600">
        <GripVertical className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest font-medium">Question {index + 1}</span>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0}
          className="p-1.5 text-gray-600 hover:text-white disabled:opacity-25" aria-label="Move question up">
          <ArrowUp className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onMove(index, 1)} disabled={index === total - 1}
          className="p-1.5 text-gray-600 hover:text-white disabled:opacity-25" aria-label="Move question down">
          <ArrowDown className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => onRemove(index)}
          className="p-1.5 text-gray-600 hover:text-red-400" aria-label="Remove question">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>

    <div className="space-y-4">
      <TextField
        label="Question" required
        value={question.label}
        onChange={value => onChange({ ...question, label: value })}
        placeholder="Do you hold a current Working with Children Check?"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Answer type"
          value={question.question_type}
          options={QUESTION_TYPES}
          onChange={value => onChange({
            ...question,
            question_type: value,
            // Changing type invalidates any accepted answers configured before.
            knockout_expected: [],
            knockout_min: null,
            knockout_max: null,
            options: CHOICE_TYPES.has(value) ? (question.options || []) : [],
          })}
        />
        <TextField
          label="Helper text"
          value={question.help_text}
          onChange={value => onChange({ ...question, help_text: value })}
          placeholder="Shown in small print under the question"
        />
      </div>

      {CHOICE_TYPES.has(question.question_type) && (
        <ListField
          label="Options" required
          items={question.options}
          onChange={value => onChange({ ...question, options: value })}
          placeholder="Option text"
          addLabel="Add option"
        />
      )}

      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <ToggleField
          label="Required"
          checked={question.required}
          onChange={value => onChange({ ...question, required: value })}
        />
        <ToggleField
          label="Use as a screening requirement"
          checked={question.is_knockout}
          onChange={value => onChange({
            ...question,
            is_knockout: value,
            required: value ? true : question.required,
          })}
        />
      </div>

      {question.is_knockout && <KnockoutEditor question={question} onChange={onChange} />}
    </div>
  </div>
);

export default function QuestionnaireBuilder({ questions, onChange }) {
  const list = Array.isArray(questions) ? questions : [];

  const updateAt = (index, next) => onChange(list.map((q, i) => (i === index ? next : q)));
  const removeAt = (index) => onChange(list.filter((_, i) => i !== index));
  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {list.length === 0 && (
        <p className="text-gray-600 text-sm">
          No screening questions yet. Applicants will see the standard application form.
        </p>
      )}

      {list.map((question, index) => (
        <QuestionCard
          key={question.id || `new-${index}`}
          question={question}
          index={index}
          total={list.length}
          onChange={next => updateAt(index, next)}
          onRemove={removeAt}
          onMove={move}
        />
      ))}

      <button
        type="button"
        onClick={() => onChange([...list, blankQuestion()])}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/15 text-sm text-gray-400 hover:text-[#FF6B00] hover:border-[#FF6B00]/40 transition-colors"
      >
        <Plus className="w-4 h-4" />Add question
      </button>
    </div>
  );
}
