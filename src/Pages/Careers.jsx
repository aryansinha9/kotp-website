// src/Pages/Careers.jsx
//
// Public careers page: every published role, with light filtering.
// Only listings with status = 'open' are readable with the anon key, so there
// is nothing here that RLS has not already allowed out.

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, MapPin, Clock, ArrowRight, Loader2, Search, Mail, Users, Trophy, Heart,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  JobListing, EMPLOYMENT_TYPES, WORKPLACE_TYPES, labelFor, formatSalary, isAcceptingApplications,
} from '@/Entities/JobListing';

const VALUES = [
  { icon: Trophy, title: 'COMPETITIVE BY NATURE', text: 'We build events people train for. Standards are high and the bar keeps moving.' },
  { icon: Users, title: 'COMMUNITY FIRST', text: 'Every tournament, program and academy session exists to grow football in Sydney.' },
  { icon: Heart, title: 'REAL OWNERSHIP', text: 'Small team, big surface area. You will own your work end to end.' },
];

const JobCard = ({ listing, index }) => {
  const open = isAcceptingApplications(listing);
  const salary = formatSalary(listing);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.4) }}
    >
      <Link
        to={`/careers/${listing.slug}`}
        className="group block bg-[#1a1a1a] border border-white/10 rounded-xl p-6 md:p-7 hover:border-[#FF6B00]/50 transition-all duration-300"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="headline-font text-2xl md:text-3xl text-white group-hover:text-[#FF6B00] transition-colors">
                {listing.title}
              </h3>
              {!open && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-400 border border-white/10">
                  Closed
                </span>
              )}
            </div>

            {listing.summary && (
              <p className="text-gray-400 text-sm md:text-base mb-4 max-w-2xl">{listing.summary}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
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
              {salary && <span className="text-[#FF6B00] font-medium">{salary}</span>}
            </div>

            {listing.application_deadline && open && (
              <p className="text-gray-600 text-xs mt-3">
                Applications close{' '}
                {format(new Date(`${listing.application_deadline}T00:00:00`), 'd MMMM yyyy')}
              </p>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2 text-[#FF6B00] headline-font tracking-wider">
            VIEW ROLE
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function Careers() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [employmentType, setEmploymentType] = useState('ALL');

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await JobListing.listPublished();
      if (active) { setListings(data); setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const departments = useMemo(
    () => [...new Set(listings.map(listing => listing.department).filter(Boolean))].sort(),
    [listings],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return listings.filter(listing => {
      if (department !== 'ALL' && listing.department !== department) return false;
      if (employmentType !== 'ALL' && listing.employment_type !== employmentType) return false;
      if (!term) return true;
      return [listing.title, listing.summary, listing.location, listing.department]
        .filter(Boolean).some(value => value.toLowerCase().includes(term));
    });
  }, [listings, search, department, employmentType]);

  const selectClass =
    'bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white ' +
    'focus:border-[#FF6B00] focus:outline-none cursor-pointer';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ── Hero ── */}
      <section className="relative pt-36 pb-16 md:pt-44 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none">
          <div className="headline-font text-[18rem] text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
            CAREERS
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[#FF6B00] headline-font tracking-[0.3em] text-sm mb-4">JOIN THE TEAM</p>
            <h1 className="headline-font text-5xl md:text-7xl lg:text-8xl text-white mb-6">
              BUILD THE GAME<br />WITH US
            </h1>
            <div className="w-24 h-1 bg-[#FF6B00] mb-6" />
            <p className="text-gray-400 text-lg max-w-2xl">
              King of the Pitch runs Sydney's most competitive street football tournaments and a
              growing academy. If you want your work to show up on a pitch full of people, start here.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {VALUES.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6"
            >
              <value.icon className="w-7 h-7 text-[#FF6B00] mb-4" />
              <h3 className="headline-font text-xl text-white mb-2">{value.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{value.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="roles" className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="headline-font text-4xl md:text-5xl text-white">OPEN ROLES</h2>
              <div className="w-20 h-1 bg-[#FF6B00] mt-3" />
            </div>
            {!loading && (
              <p className="text-gray-500 text-sm">
                {filtered.length} {filtered.length === 1 ? 'role' : 'roles'}
              </p>
            )}
          </div>

          {!loading && listings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-600 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-[#FF6B00] focus:outline-none"
                  placeholder="Search roles" value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className={selectClass} value={department}
                onChange={e => setDepartment(e.target.value)}>
                <option value="ALL">All teams</option>
                {departments.map(item => (
                  <option key={item} value={item} className="bg-[#1a1a1a]">{item}</option>
                ))}
              </select>
              <select className={selectClass} value={employmentType}
                onChange={e => setEmploymentType(e.target.value)}>
                <option value="ALL">Any employment type</option>
                {EMPLOYMENT_TYPES.map(option => (
                  <option key={option.value} value={option.value} className="bg-[#1a1a1a]">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl py-16 px-6 text-center">
              <Briefcase className="w-10 h-10 text-gray-700 mx-auto mb-5" />
              <h3 className="headline-font text-2xl text-white mb-2">
                {listings.length ? 'NOTHING MATCHES THAT' : 'NO OPEN ROLES RIGHT NOW'}
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                {listings.length
                  ? 'Try clearing the filters.'
                  : 'We hire in bursts around our tournament calendar. Send us a note and we will keep you in mind when something opens up.'}
              </p>
              {!listings.length && (
                <a href="mailto:kotp.football@gmail.com?subject=Expression%20of%20interest"
                  className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-6 py-3 rounded-lg headline-font tracking-wider hover:bg-[#FF6B00]/90 transition-colors">
                  <Mail className="w-4 h-4" />GET IN TOUCH
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((listing, index) => (
                <JobCard key={listing.id} listing={listing} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
