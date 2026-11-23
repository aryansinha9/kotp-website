// src/Pages/JobDetail.jsx
//
// One published role plus its application form, at /careers/:slug.
// A draft, closed or archived role is simply not readable with the anon key,
// so an unpublished slug renders the same "not found" state as a typo.

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Briefcase, MapPin, Clock, Users, CalendarClock, Loader2, Mail, Share2, Check,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  JobListing, EMPLOYMENT_TYPES, WORKPLACE_TYPES, EXPERIENCE_LEVELS,
  labelFor, formatSalary, isAcceptingApplications,
} from '@/Entities/JobListing';
import JobApplicationForm from '@/Components/Careers/JobApplicationForm';

const BulletList = ({ title, items }) => {
  if (!items?.length) return null;
  return (
    <section>
      <h2 className="headline-font text-2xl text-white mb-4">{title}</h2>
      <ul className="space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 text-gray-400 leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

const Prose = ({ title, text }) => {
  if (!text?.trim()) return null;
  return (
    <section>
      {title && <h2 className="headline-font text-2xl text-white mb-4">{title}</h2>}
      <div className="text-gray-400 leading-relaxed whitespace-pre-wrap">{text}</div>
    </section>
  );
};

const MetaRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <Icon className="w-4 h-4 text-[#FF6B00] mt-0.5 shrink-0" />
      <div>
        <p className="text-gray-600 text-xs uppercase tracking-wider">{label}</p>
        <p className="text-white text-sm mt-0.5">{value}</p>
      </div>
    </div>
  );
};

export default function JobDetail() {
  const { slug } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const data = await JobListing.getPublishedBySlug(slug);
      if (active) { setListing(data); setLoading(false); }
    })();
    return () => { active = false; };
  }, [slug]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch { /* the person dismissed the share sheet */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="headline-font text-5xl text-white mb-4">ROLE NOT FOUND</h1>
          <p className="text-gray-500 mb-8">
            This role may have been filled or closed since you saved the link.
          </p>
          <Link to="/careers"
            className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-6 py-3 rounded-lg headline-font tracking-wider hover:bg-[#FF6B00]/90 transition-colors">
            <ArrowLeft className="w-4 h-4" />SEE OPEN ROLES
          </Link>
        </div>
      </div>
    );
  }

  const accepting = isAcceptingApplications(listing);
  const salary = formatSalary(listing);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ── Header ── */}
      <section className="pt-32 pb-10 md:pt-40 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <Link to="/careers"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />All roles
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <h1 className="headline-font text-4xl md:text-6xl text-white mb-4">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400 mb-6">
              {listing.department && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#FF6B00]" />{listing.department}
                </span>
              )}
              {listing.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />{listing.location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#FF6B00]" />
                {labelFor(EMPLOYMENT_TYPES, listing.employment_type)}
                {' · '}
                {labelFor(WORKPLACE_TYPES, listing.workplace_type)}
              </span>
              {salary && <span className="text-[#FF6B00] font-semibold">{salary}</span>}
            </div>

            <div className="flex flex-wrap gap-3">
              {accepting ? (
                <a href="#apply"
                  className="kotp-button bg-[#FF6B00] text-white px-7 py-3.5 rounded-lg headline-font tracking-wider hover:scale-[1.02] transition-transform">
                  APPLY FOR THIS ROLE
                </a>
              ) : (
                <span className="bg-white/5 border border-white/10 text-gray-400 px-7 py-3.5 rounded-lg headline-font tracking-wider">
                  APPLICATIONS CLOSED
                </span>
              )}
              <button onClick={share}
                className="flex items-center gap-2 border border-white/10 text-gray-300 px-5 py-3.5 rounded-lg text-sm hover:border-[#FF6B00]/40 hover:text-white transition-colors">
                {copied ? <Check className="w-4 h-4 text-[#FF6B00]" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Link copied' : 'Share'}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Prose title="ABOUT THE ROLE" text={listing.description} />
            <BulletList title="WHAT YOU WILL DO" items={listing.responsibilities} />
            <BulletList title="WHAT WE ARE LOOKING FOR" items={listing.requirements} />
            <BulletList title="QUALIFICATIONS" items={listing.qualifications} />
            <BulletList title="SKILLS" items={listing.skills} />
            <BulletList title="WHAT WE OFFER" items={listing.benefits} />
            <Prose title="ABOUT THE TEAM" text={listing.about_team} />
            <Prose title="HOW TO APPLY" text={listing.how_to_apply} />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 lg:sticky lg:top-24">
              <h3 className="headline-font text-lg text-white mb-3">ROLE DETAILS</h3>
              <MetaRow icon={Briefcase} label="Employment type"
                value={labelFor(EMPLOYMENT_TYPES, listing.employment_type)} />
              <MetaRow icon={MapPin} label="Workplace"
                value={[labelFor(WORKPLACE_TYPES, listing.workplace_type), listing.location]
                  .filter(Boolean).join(' · ')} />
              <MetaRow icon={Users} label="Experience"
                value={listing.experience_level
                  ? labelFor(EXPERIENCE_LEVELS, listing.experience_level) : null} />
              <MetaRow icon={Users} label="Openings"
                value={listing.openings > 1 ? `${listing.openings} positions` : null} />
              <MetaRow icon={CalendarClock} label="Applications close"
                value={listing.application_deadline
                  ? format(new Date(`${listing.application_deadline}T00:00:00`), 'd MMMM yyyy')
                  : null} />
              <MetaRow icon={CalendarClock} label="Posted"
                value={listing.published_at
                  ? format(new Date(listing.published_at), 'd MMMM yyyy') : null} />
              {listing.contact_email && (
                <a href={`mailto:${listing.contact_email}`}
                  className="flex items-center gap-2 text-sm text-[#FF6B00] hover:underline mt-4">
                  <Mail className="w-4 h-4" />{listing.contact_email}
                </a>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* ── Apply ── */}
      <section id="apply" className="px-4 sm:px-6 lg:px-8 pb-24 scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="headline-font text-4xl md:text-5xl text-white">APPLY</h2>
            <div className="w-20 h-1 bg-[#FF6B00] mt-3" />
          </div>

          {accepting ? (
            <JobApplicationForm listing={listing} />
          ) : (
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 text-center">
              <h3 className="headline-font text-2xl text-white mb-2">APPLICATIONS ARE CLOSED</h3>
              <p className="text-gray-500 text-sm mb-6">
                We are no longer taking applications for this role.
              </p>
              <Link to="/careers"
                className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-6 py-3 rounded-lg headline-font tracking-wider hover:bg-[#FF6B00]/90 transition-colors">
                SEE OTHER ROLES
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
