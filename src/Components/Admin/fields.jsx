// src/Components/Admin/fields.jsx
//
// Small dark-theme form primitives shared by the careers admin screens.
// They exist so the job editor reads as a form rather than as a wall of
// Tailwind classes, and so every field looks the same.

import React from 'react';
import { Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';

export const inputClass =
  'w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white ' +
  'placeholder:text-gray-600 focus:border-[#FF6B00] focus:outline-none transition-colors';

export const Field = ({ label, hint, required, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1.5">
      {label}{required && <span className="text-[#FF6B00] ml-1">*</span>}
    </label>
    {children}
    {hint && <p className="text-gray-600 text-xs mt-1.5">{hint}</p>}
  </div>
);

export const TextField = ({ label, hint, required, value, onChange, ...rest }) => (
  <Field label={label} hint={hint} required={required}>
    <input
      className={inputClass}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      {...rest}
    />
  </Field>
);

export const AreaField = ({ label, hint, required, value, onChange, rows = 5, ...rest }) => (
  <Field label={label} hint={hint} required={required}>
    <textarea
      className={`${inputClass} resize-y leading-relaxed`}
      rows={rows}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      {...rest}
    />
  </Field>
);

export const SelectField = ({ label, hint, value, onChange, options, placeholder }) => (
  <Field label={label} hint={hint}>
    <select
      className={`${inputClass} appearance-none cursor-pointer`}
      value={value ?? ''}
      onChange={e => onChange(e.target.value || null)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(option => (
        <option key={option.value} value={option.value} className="bg-[#1a1a1a]">
          {option.label}
        </option>
      ))}
    </select>
  </Field>
);

export const ToggleField = ({ label, hint, checked, onChange }) => (
  <label className="flex items-start gap-3 cursor-pointer group py-1">
    <input
      type="checkbox"
      checked={Boolean(checked)}
      onChange={e => onChange(e.target.checked)}
      className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-[#0a0a0a] accent-[#FF6B00] cursor-pointer"
    />
    <span>
      <span className="block text-sm text-white group-hover:text-[#FF6B00] transition-colors">{label}</span>
      {hint && <span className="block text-gray-600 text-xs mt-0.5">{hint}</span>}
    </span>
  </label>
);

/**
 * Editor for a TEXT[] column: bullet points, options, accepted answers.
 * Items keep their order, which is the order applicants see.
 */
export const ListField = ({ label, hint, items, onChange, placeholder, addLabel = 'Add item' }) => {
  const list = Array.isArray(items) ? items : [];

  const setAt = (index, value) => onChange(list.map((item, i) => (i === index ? value : item)));
  const removeAt = (index) => onChange(list.filter((_, i) => i !== index));
  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        {list.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <input
              className={inputClass}
              value={item}
              placeholder={placeholder}
              onChange={e => setAt(index, e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onChange([...list.slice(0, index + 1), '', ...list.slice(index + 1)]);
                }
              }}
            />
            <button type="button" onClick={() => move(index, -1)} disabled={index === 0}
              className="p-2 text-gray-600 hover:text-white disabled:opacity-25 disabled:hover:text-gray-600"
              aria-label="Move up">
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => move(index, 1)} disabled={index === list.length - 1}
              className="p-2 text-gray-600 hover:text-white disabled:opacity-25 disabled:hover:text-gray-600"
              aria-label="Move down">
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => removeAt(index)}
              className="p-2 text-gray-600 hover:text-red-400" aria-label="Remove">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...list, ''])}
          className="flex items-center gap-1.5 text-xs text-[#FF6B00] hover:text-[#FF8C00] font-medium px-1 py-1.5">
          <Plus className="w-3.5 h-3.5" />{addLabel}
        </button>
      </div>
    </Field>
  );
};

export const Section = ({ title, description, children }) => (
  <section className="bg-[#111111] border border-white/10 rounded-xl p-5 md:p-6">
    <header className="mb-5">
      <h3 className="headline-font text-xl text-white">{title}</h3>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
    </header>
    {children}
  </section>
);

const TONES = {
  blue:   'bg-blue-500/15 text-blue-400 border-blue-500/20',
  amber:  'bg-amber-500/15 text-amber-400 border-amber-500/20',
  orange: 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  teal:   'bg-teal-500/15 text-teal-300 border-teal-500/20',
  green:  'bg-green-500/15 text-green-400 border-green-500/20',
  red:    'bg-red-500/15 text-red-400 border-red-500/20',
  gray:   'bg-white/5 text-gray-400 border-white/10',
};

export const Pill = ({ tone = 'gray', children, className = '' }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${TONES[tone] || TONES.gray} ${className}`}>
    {children}
  </span>
);
