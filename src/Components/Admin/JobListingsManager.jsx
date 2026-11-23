// src/Components/Admin/JobListingsManager.jsx
//
// The "Job Listings" section of the admin dashboard: every role in one table,
// with create, edit, duplicate, publish/close and delete.

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Loader2, Pencil, Trash2, Copy, Eye, EyeOff, ExternalLink,
  Briefcase, Users, AlertCircle, RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  JobListing, EMPLOYMENT_TYPES, WORKPLACE_TYPES, labelFor, isAcceptingApplications,
} from '@/Entities/JobListing';
import { Pill } from './fields';
import JobListingForm from './JobListingForm';

const STATUS_TONE = { open: 'green', draft: 'amber', closed: 'gray', archived: 'gray' };

export default function JobListingsManager({ onViewApplications, onCountChange }) {
  const [listings, setListings] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | {} (new) | listing

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data, error: loadError }, countMap] = await Promise.all([
      JobListing.listAll(),
      JobListing.applicationCounts(),
    ]);
    setListings(data);
    setCounts(countMap);
    setError(loadError ? loadError.message : '');
    setLoading(false);
    onCountChange?.(data.length);
  }, [onCountChange]);

  useEffect(() => { load(); }, [load]);

  const togglePublished = async (listing) => {
    const next = listing.status === 'open' ? 'closed' : 'open';
    const { error: updateError } = await JobListing.update(listing.id, { status: next });
    if (updateError) { setError(updateError.message); return; }
    await load();
  };

  const duplicate = async (listing) => {
    const { data: questions } = await JobListing.getQuestions(listing.id);
    const copy = { ...listing };
    ['id', 'created_at', 'updated_at', 'created_by', 'published_at'].forEach(key => delete copy[key]);

    const { data, error: createError } = await JobListing.create({
      ...copy,
      title: `${listing.title} (copy)`,
      slug: `${listing.slug}-copy-${Date.now().toString(36).slice(-4)}`,
      status: 'draft',
    });
    if (createError) { setError(createError.message); return; }

    if (questions.length) {
      await JobListing.saveQuestions(
        data.id,
        questions.map(question => ({ ...question, id: null })),
      );
    }
    await load();
  };

  const remove = async (listing) => {
    const applications = counts[listing.id]?.total || 0;
    const warning = applications
      ? `"${listing.title}" has ${applications} application${applications === 1 ? '' : 's'}.\n\n` +
        'Deleting the role keeps those applications (the role name is retained on each one), ' +
        'but they will no longer be grouped under it.\n\nDelete the role?'
      : `Delete "${listing.title}"? This cannot be undone.`;
    if (!window.confirm(warning)) return;

    const { error: deleteError } = await JobListing.remove(listing.id);
    if (deleteError) { setError(deleteError.message); return; }
    await load();
  };

  if (editing) {
    return (
      <JobListingForm
        listing={editing.id ? editing : null}
        onCancel={() => setEditing(null)}
        onDone={async () => { setEditing(null); await load(); }}
      />
    );
  }

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
          <h2 className="headline-font text-3xl text-white">Job Listings</h2>
          <p className="text-gray-600 text-sm mt-0.5">
            {listings.length} role{listings.length === 1 ? '' : 's'} &middot;{' '}
            {listings.filter(l => l.status === 'open').length} published
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 text-white px-3 py-2.5 rounded-lg text-sm hover:bg-white/5">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setEditing({})}
            className="flex items-center gap-2 bg-[#FF6B00] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#FF6B00]/90">
            <Plus className="w-4 h-4" />New role
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 mb-5">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <Briefcase className="w-8 h-8 text-gray-700 mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">No roles yet</p>
          <p className="text-gray-600 text-sm mb-5">
            Create your first listing - it stays a draft until you publish it.
          </p>
          <button onClick={() => setEditing({})}
            className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#FF6B00]/90">
            <Plus className="w-4 h-4" />New role
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing, index) => {
            const applications = counts[listing.id] || { total: 0, new: 0 };
            const expired = listing.status === 'open' && !isAcceptingApplications(listing);

            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
                className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 md:p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-white font-semibold truncate">{listing.title}</h3>
                      <Pill tone={STATUS_TONE[listing.status]}>
                        {listing.status === 'open' ? 'Published' : listing.status}
                      </Pill>
                      {expired && <Pill tone="red">Deadline passed</Pill>}
                    </div>
                    <p className="text-gray-500 text-sm truncate">
                      {[
                        labelFor(EMPLOYMENT_TYPES, listing.employment_type),
                        labelFor(WORKPLACE_TYPES, listing.workplace_type),
                        listing.location,
                        listing.department,
                      ].filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-gray-600 text-xs mt-1.5">
                      /careers/{listing.slug}
                      {listing.application_deadline &&
                        ` · closes ${format(new Date(`${listing.application_deadline}T00:00:00`), 'd MMM yyyy')}`}
                    </p>
                  </div>

                  <button
                    onClick={() => onViewApplications?.(listing.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0d0d0d] border border-white/5 hover:border-[#FF6B00]/40 transition-colors shrink-0"
                  >
                    <Users className="w-4 h-4 text-[#FF6B00]" />
                    <span className="text-sm text-white font-semibold">{applications.total}</span>
                    <span className="text-xs text-gray-500">
                      application{applications.total === 1 ? '' : 's'}
                    </span>
                    {applications.new > 0 && <Pill tone="blue">{applications.new} new</Pill>}
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    {listing.status === 'open' && (
                      <a href={`/careers/${listing.slug}`} target="_blank" rel="noopener noreferrer"
                        title="View the public page"
                        className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => togglePublished(listing)}
                      title={listing.status === 'open' ? 'Close applications' : 'Publish'}
                      className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5">
                      {listing.status === 'open'
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => duplicate(listing)} title="Duplicate"
                      className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditing(listing)} title="Edit"
                      className="p-2 text-gray-500 hover:text-[#FF6B00] rounded-lg hover:bg-white/5">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(listing)} title="Delete"
                      className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
