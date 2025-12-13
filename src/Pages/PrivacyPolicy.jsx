// src/Pages/PrivacyPolicy.jsx (New Redesigned Version)

import React from 'react';

const sections = [
  { href: '#what-info', title: '1. WHAT INFORMATION DO WE COLLECT?' },
  { href: '#how-we-use', title: '2. HOW WE USE YOUR INFORMATION' },
  { href: '#how-long', title: '3. HOW LONG WE KEEP YOUR INFORMATION' },
  { href: '#how-safe', title: '4. HOW WE KEEP YOUR INFORMATION SAFE' },
  { href: '#minors-data', title: '5. DATA OF MINORS' },
  { href: '#privacy-rights', title: '6. YOUR PRIVACY RIGHTS' },
  { href: '#australia-rights', title: '7. PRIVACY RIGHTS FOR AUSTRALIA' },
  { href: '#updates', title: '8. UPDATES TO THIS PRIVACY POLICY' },
  { href: '#contact-info', title: '9. CONTACT INFORMATION' },
  { href: '#data-review', title: '10. DATA REVIEW, UPDATE, AND DELETION' },
];

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#0a0a0a] py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-gray-300">
        <div className="text-base leading-7">
          <p className="text-base font-semibold leading-7 text-[#FF6B00] headline-font tracking-wider">Privacy Notice</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl headline-font">Privacy Policy</h1>
          <p className="mt-6 text-xl leading-8">Last Updated: August 28, 2025</p>

          <p className="mt-6">
            This privacy notice for A&A Sporting Enterprises PTY LTD (trading as King of the Pitch, "we," "us," or "our") describes how and why we collect, store, use, and share your information when you use our services ("Services").
          </p>

          <div className="mt-12 p-6 border-t border-b border-white/10">
            <h2 className="text-xl font-bold tracking-tight text-white headline-font">TABLE OF CONTENTS</h2>
            <ol role="list" className="mt-4 space-y-2 list-decimal pl-5">
              {sections.map(section => (
                <li key={section.href}>
                  <a href={section.href} className="font-semibold text-[#FF6B00] hover:text-orange-400 transition-colors">{section.title}</a>
                </li>
              ))}
            </ol>
          </div>

          <div id="what-info" className="mt-16 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white headline-font">1. WHAT INFORMATION DO WE COLLECT?</h2>
            <div className="my-6 p-4 border-l-4 border-[#FF6B00] bg-[#1a1a1a] rounded-r-lg">
              <p className="text-gray-200"><strong>In Short:</strong> We collect personal information that you provide during tournament registration.</p>
            </div>
            <p>The information collected may include: Team name, Contact person's name, email, and phone number, Age group or division, Registration creation date, and Payment details like status, amount paid, and Stripe session ID. We do not use Google Analytics or other tracking tools.</p>
          </div>

          <div id="how-we-use" className="mt-16 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white headline-font">2. HOW WE USE YOUR INFORMATION</h2>
            <div className="my-6 p-4 border-l-4 border-[#FF6B00] bg-[#1a1a1a] rounded-r-lg">
              <p className="text-gray-200"><strong>In Short:</strong> Your information is used to manage tournament operations, communicate with participants, and send updates or promotional content.</p>
            </div>
            <p>We use your information for Tournament Operations, Communication, Marketing & Promotions, and Security & Compliance. Payments are securely processed through Stripe.</p>
          </div>

          {/* ... Other sections follow the same pattern ... */}
          <div id="how-long" className="mt-16 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white headline-font">3. HOW LONG WE KEEP YOUR INFORMATION</h2>
            <div className="my-6 p-4 border-l-4 border-[#FF6B00] bg-[#1a1a1a] rounded-r-lg">
              <p className="text-gray-200"><strong>In Short:</strong> We keep your personal information only as long as necessary to run the tournament.</p>
            </div>
            <p>Data is stored for the duration of the tournament and deleted afterward, though owners may keep an optional copy. You may request deletion at any time.</p>
          </div>

          <div id="how-safe" className="mt-16 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white headline-font">4. HOW WE KEEP YOUR INFORMATION SAFE</h2>
            <div className="my-6 p-4 border-l-4 border-[#FF6B00] bg-[#1a1a1a] rounded-r-lg">
              <p className="text-gray-200"><strong>In Short:</strong> We take reasonable measures to protect your data, but no system is 100% secure.</p>
            </div>
            <p>Access to data is restricted via a password-protected admin dashboard and direct database access is limited to the IT manager. We do not store credit card details.</p>
          </div>

          <div id="minors-data" className="mt-16 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white headline-font">5. DATA OF MINORS</h2>
            <div className="my-6 p-4 border-l-4 border-[#FF6B00] bg-[#1a1a1a] rounded-r-lg">
              <p className="text-gray-200"><strong>In Short:</strong> We do not directly collect information from children under 18.</p>
            </div>
            <p>Team contacts are responsible for obtaining consent from minors' parents/guardians. Parent/guardian requests for deletion of minor data are promptly honored.</p>
          </div>

          <div id="privacy-rights" className="mt-16 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white headline-font">6. YOUR PRIVACY RIGHTS</h2>
            <div className="my-6 p-4 border-l-4 border-[#FF6B00] bg-[#1a1a1a] rounded-r-lg">
              <p className="text-gray-200"><strong>In Short:</strong> You may access, correct, delete, or manage how your personal information is used.</p>
            </div>
            <p>To exercise your rights, including access, correction, deletion, or opting out of marketing, contact our privacy team at <a href="mailto:kotp.football@gmail.com" className="font-semibold text-[#FF6B00] hover:text-orange-400">kotp.football@gmail.com</a>.</p>
          </div>

          <div id="australia-rights" className="mt-16 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white headline-font">7. PRIVACY RIGHTS FOR AUSTRALIA</h2>
            <div className="my-6 p-4 border-l-4 border-[#FF6B00] bg-[#1a1a1a] rounded-r-lg">
              <p className="text-gray-200"><strong>In Short:</strong> Your data is protected under the Privacy Act 1988 (Cth) and Australian Privacy Principles (APPs).</p>
            </div>
            <p>You can request access to, or correction of, your personal information. Complaints can be made to our privacy team or the Office of the Australian Information Commissioner (OAIC).</p>
          </div>

          <div id="updates" className="mt-16 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white headline-font">8. UPDATES TO THIS PRIVACY POLICY</h2>
            <div className="my-6 p-4 border-l-4 border-[#FF6B00] bg-[#1a1a1a] rounded-r-lg">
              <p className="text-gray-200"><strong>In Short:</strong> This policy may be updated from time to time.</p>
            </div>
            <p>Updates are indicated by the "Last Updated" date. By completing registration, you confirm that you have read, understood, and agreed to this Privacy Policy.</p>
          </div>

          <div id="contact-info" className="mt-16 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white headline-font">9. CONTACT INFORMATION</h2>
            <p>For questions or concerns, contact our privacy team:</p>
            <address className="mt-4 not-italic text-gray-400">
              <strong>Email:</strong> <a href="mailto:kotp.football@gmail.com" className="font-semibold text-[#FF6B00] hover:text-orange-400">kotp.football@gmail.com</a><br />
              <strong>Phone:</strong> <a href="tel:+61481269391" className="font-semibold text-[#FF6B00] hover:text-orange-400">+61 481 269 391</a><br />
              <strong>Address:</strong> King of the Pitch, 20 Lorikeet Street, Glenwood NSW 2768, Australia
            </address>
          </div>

          <div id="data-review" className="mt-16 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white headline-font">10. DATA REVIEW, UPDATE, AND DELETION</h2>
            <div className="my-6 p-4 border-l-4 border-[#FF6B00] bg-[#1a1a1a] rounded-r-lg">
              <p className="text-gray-200"><strong>In Short:</strong> You can request access, updates, or deletion of your personal information.</p>
            </div>
            <p>All requests are handled promptly by our privacy team. To submit a request, please use the contact information provided above.</p>
          </div>
        </div>
      </div>
    </div>
  );
}