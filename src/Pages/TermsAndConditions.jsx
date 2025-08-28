// src/Pages/TermsAndConditions.jsx (Updated with Professional Styling)

import React from 'react';

// Helper array to auto-generate the Table of Contents.
const sections = [
  { href: '#conditions-of-entry', title: '1. Conditions of Entry' },
  { href: '#registration-reqs', title: '2. Registration Requirements' },
  { href: '#fees-payments', title: '3. Fees & Payments' },
  { href: '#refunds-cancellations', title: '4. Refunds & Cancellations' },
  { href: '#media-consent', title: '5. Media Consent' },
  { href: '#liability', title: '6. Liability' },
  { href: '#acceptance', title: '7. Acceptance' },
];

export default function TermsAndConditions() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-base leading-7 text-slate-700">
          <p className="text-base font-semibold leading-7 text-amber-600">Legal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Terms & Conditions</h1>
          <p className="mt-6 text-xl leading-8">Last Updated: August 28, 2025</p>

          <p className="mt-6">
            By registering, attending, or participating in any KOTP (King of the Pitch) soccer tournaments hosted at Ultimate Soccer, you agree to the following Terms and Conditions. These terms apply to all players, spectators, coaches, and visitors.
          </p>
          
          <hr className="my-12" />

          <div className="mb-12">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">TABLE OF CONTENTS</h2>
            <ol role="list" className="mt-4 space-y-2 text-slate-600 list-decimal pl-5">
              {sections.map(section => (
                <li key={section.href}>
                  <a href={section.href} className="font-semibold text-amber-600 hover:text-amber-500">{section.title}</a>
                </li>
              ))}
            </ol>
          </div>

          {/* --- Main Terms Content --- */}

          <div id="conditions-of-entry" className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">1. Conditions of Entry</h2>
            <ul role="list" className="mt-6 space-y-4 text-slate-600 list-disc pl-5">
              <li>All persons entering the premises of Ultimate Soccer accept responsibility for any injury or illness arising out of or in connection with their participation in activities at the premises.</li>
              <li>All persons entering the premises release and discharge KOTP, its employees and agents from any claim, suit, demand, expense, or cost in respect of any injury or illness arising out of or in connection with their participation.</li>
              <li>Players and spectators use the Ultimate Soccer facilities at their own risk. KOTP, its parent, or affiliates do not accept responsibility for injury or loss occurring before, during, or after events.</li>
              <li>The use of the facility is subject to the following rules:
                <ul role="list" className="mt-4 space-y-2 list-circle pl-5">
                  <li>Climbing on fencing or netting structures is strictly prohibited.</li>
                  <li>No alcohol, food, or chewing gum is allowed on the pitch.</li>
                  <li>Glass bottles are not permitted on the premises.</li>
                  <li>Smoking and the use of e-cigarettes are prohibited in all facility areas.</li>
                  <li>Intoxicated persons will not be allowed to play.</li>
                  <li>Children under 16 must be supervised by an adult at all times.</li>
                  <li>Players must vacate the pitch by the end of their allocated time without exception.</li>
                </ul>
              </li>
              <li>KOTP reserves the right to eject any persons who breach these rules without refund.</li>
              <li>No commercial activities may be conducted at KOTP events without written approval from Ultimate Soccer and KOTP.</li>
              <li>By entering the facility, you consent to video, audio, and/or photography being taken for marketing and promotional purposes.</li>
              <li>CCTV operates throughout the clubhouse, car parks, and pitches. Footage may be stored securely and used for safety, promotional, and marketing purposes.</li>
            </ul>
            <p className="mt-4"><strong>By participating in a KOTP competition, all attendees confirm that they understand and accept these conditions of entry.</strong></p>
          </div>
          
          <div id="registration-reqs" className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">2. Registration Requirements</h2>
            <ul role="list" className="mt-6 space-y-4 text-slate-600 list-disc pl-5">
              <li>All players and teams must complete registration through the official KOTP registration system (website registration process).</li>
              <li>By registering, you confirm that the information provided is true, accurate, and complete.</li>
              <li>KOTP reserves the right to cancel or refuse registrations found to contain false or misleading details.</li>
              <li>Registration is not confirmed until the required fixed fee is paid in full.</li>
            </ul>
          </div>

          <div id="fees-payments" className="mt-16">
             <h2 className="text-2xl font-bold tracking-tight text-slate-900">3. Fees & Payments</h2>
             <ul role="list" className="mt-6 space-y-4 text-slate-600 list-disc pl-5">
               <li>A fixed registration fee applies to all teams and players.</li>
               <li>Payment must be made in full before participation is confirmed.</li>
               <li>Fees are non-transferable to other events unless expressly approved by KOTP.</li>
             </ul>
           </div>
          
           <div id="refunds-cancellations" className="mt-16">
             <h2 className="text-2xl font-bold tracking-tight text-slate-900">4. Refunds & Cancellations</h2>
             <ul role="list" className="mt-6 space-y-4 text-slate-600 list-disc pl-5">
               <li><strong>Player/Team Cancellations:</strong> Cancellations made by players or teams after registration will not be refunded. No refunds will be given for non-attendance.</li>
               <li><strong>Event Cancellations (by KOTP):</strong> If an event is cancelled entirely by KOTP, a full refund will be issued to the registered players/teams.</li>
               <li><strong>Event Postponements:</strong> If an event is postponed, registrations will automatically transfer to the new date. If you are unable to attend the rescheduled date, you may request a full refund within 7 days of notification of the new date.</li>
             </ul>
           </div>
          
           <div id="media-consent" className="mt-16">
             <h2 className="text-2xl font-bold tracking-tight text-slate-900">5. Media Consent</h2>
             <p className="mt-6">By attending any KOTP event, you consent to photographs, videos, and audio recordings being taken and used across KOTP websites, social media, and promotional materials. KOTP retains full rights to all media content captured at events.</p>
           </div>

           <div id="liability" className="mt-16">
             <h2 className="text-2xl font-bold tracking-tight text-slate-900">6. Liability</h2>
             <ul role="list" className="mt-6 space-y-4 text-slate-600 list-disc pl-5">
               <li>Participation in KOTP tournaments and use of Ultimate Soccer facilities is at your own risk.</li>
               <li>KOTP is not liable for injuries, illnesses, or personal property loss before, during, or after events.</li>
             </ul>
           </div>

           <div id="acceptance" className="mt-16">
             <h2 className="text-2xl font-bold tracking-tight text-slate-900">7. Acceptance</h2>
             <p className="mt-6">By registering via the KOTP website and/or participating in KOTP events, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.</p>
           </div>
           
        </div>
      </div>
    </div>
  );
}