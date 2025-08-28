// src/Pages/PrivacyPolicy.jsx (Updated with Professional Styling)

import React from 'react';

// This is a helper array to auto-generate the Table of Contents.
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
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-base leading-7 text-slate-700">
          <p className="text-base font-semibold leading-7 text-amber-600">Privacy Notice</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Privacy Policy</h1>
          <p className="mt-6 text-xl leading-8">Last Updated: August 28, 2025</p>

          <p className="mt-6">
            This privacy notice for A&A Sporting Enterprises PTY LTD (trading as King of the Pitch, “we,” “us,” or “our”) describes how and why we collect, store, use, and share your information when you use our services (“Services”), including when you:
          </p>
          <ul role="list" className="mt-4 max-w-xl space-y-2 text-slate-600">
            <li>Visit our website at https://www.kingofthepitch.com.au</li>
            <li>Register for any of our football tournaments</li>
            <li>Engage with us in other related ways, including marketing or events</li>
          </ul>
          <p className="mt-4">
            If you have any questions or concerns about this Privacy Policy, please contact our privacy team at <a href="mailto:kotp.football@gmail.com" className="font-semibold text-amber-600 hover:text-amber-500">kotp.football@gmail.com</a>.
          </p>

          <div className="mt-12 p-6 border-t border-b border-slate-200">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">SUMMARY OF KEY POINTS</h2>
            <ul role="list" className="mt-4 space-y-2 text-slate-600 list-disc pl-5">
                <li><strong>Information Collected:</strong> We collect personal information provided by you during registration.</li>
                <li><strong>Sensitive Information:</strong> We do not collect sensitive personal information.</li>
                <li><strong>Third-Party Sharing:</strong> We only share data with Stripe for secure payment processing.</li>
                <li><strong>Data Retention:</strong> Information is retained for the duration of the tournament.</li>
                <li><strong>Your Privacy Rights:</strong> You can access, correct, delete your information, or opt out of marketing emails.</li>
            </ul>
          </div>
          
          <div className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">TABLE OF CONTENTS</h2>
            <ol role="list" className="mt-4 space-y-2 text-slate-600 list-decimal pl-5">
              {sections.map(section => (
                <li key={section.href}>
                  <a href={section.href} className="font-semibold text-amber-600 hover:text-amber-500">{section.title}</a>
                </li>
              ))}
            </ol>
          </div>

          {/* --- Main Policy Content --- */}

          <div id="what-info" className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">1. WHAT INFORMATION DO WE COLLECT?</h2>
            <div className="my-6 p-4 border-l-4 border-amber-400 bg-slate-50 rounded-r-lg">
              <p className="text-slate-800"><strong>In Short:</strong> We collect personal information that you provide during tournament registration.</p>
            </div>
            <p className="mt-6">The information collected may include:</p>
            <ul role="list" className="mt-4 max-w-xl space-y-2 text-slate-600 list-disc pl-5">
              <li>Team name</li>
              <li>Contact person’s name, email, and phone number</li>
              <li>Age group or division registered</li>
              <li>Registration creation date</li>
              <li>Payment status, amount paid, and Stripe session ID</li>
            </ul>
            <p className="mt-4">We do not use Google Analytics or other tracking tools. Only authorized King of the Pitch staff have access to this information.</p>
          </div>
          
          <div id="how-we-use" className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">2. HOW WE USE YOUR INFORMATION</h2>
            <div className="my-6 p-4 border-l-4 border-amber-400 bg-slate-50 rounded-r-lg">
              <p className="text-slate-800"><strong>In Short:</strong> Your information is used to manage tournament operations, communicate with participants, and send updates or promotional content.</p>
            </div>
            <ul role="list" className="mt-4 space-y-2 text-slate-600 list-disc pl-5">
                <li><strong>Tournament Operations:</strong> Organizing matches, checking teams in, handling disputes or refunds.</li>
                <li><strong>Communication:</strong> Responding to inquiries, providing customer support, sending registration updates.</li>
                <li><strong>Marketing & Promotions:</strong> Sending newsletters, promotional emails, sharing results and photos.</li>
                <li><strong>Security & Compliance:</strong> Protecting systems and complying with legal obligations.</li>
            </ul>
            <p className="mt-4">All information is handled manually by authorized King of the Pitch staff. Payments are securely processed through Stripe.</p>
          </div>

          <div id="how-long" className="mt-16">
             <h2 className="text-2xl font-bold tracking-tight text-slate-900">3. HOW LONG WE KEEP YOUR INFORMATION</h2>
             <div className="my-6 p-4 border-l-4 border-amber-400 bg-slate-50 rounded-r-lg">
               <p className="text-slate-800"><strong>In Short:</strong> We keep your personal information only as long as necessary to run the tournament.</p>
             </div>
             <p className="mt-6">Data is stored in our systems for the duration of the tournament and deleted afterward. Owners may optionally keep a copy for administrative purposes. You may request deletion of your information at any time, and we will promptly comply.</p>
           </div>
          
           <div id="how-safe" className="mt-16">
             <h2 className="text-2xl font-bold tracking-tight text-slate-900">4. HOW WE KEEP YOUR INFORMATION SAFE</h2>
             <div className="my-6 p-4 border-l-4 border-amber-400 bg-slate-50 rounded-r-lg">
               <p className="text-slate-800"><strong>In Short:</strong> We take reasonable measures to protect your data, but no system is 100% secure.</p>
             </div>
             <ul role="list" className="mt-4 space-y-2 text-slate-600 list-disc pl-5">
                 <li><strong>Admin Dashboard:</strong> Password-protected; accessible only to authorized staff.</li>
                 <li><strong>Database Access:</strong> Supabase database accessible only to IT manager.</li>
                 <li><strong>Payment Security:</strong> Handled securely via Stripe; we do not store card details.</li>
                 <li><strong>Disclaimer:</strong> Despite safeguards, unauthorized access by third parties cannot be completely prevented.</li>
             </ul>
           </div>
          
           <div id="minors-data" className="mt-16">
             <h2 className="text-2xl font-bold tracking-tight text-slate-900">5. DATA OF MINORS</h2>
             <div className="my-6 p-4 border-l-4 border-amber-400 bg-slate-50 rounded-r-lg">
               <p className="text-slate-800"><strong>In Short:</strong> We do not directly collect information from children under 18.</p>
             </div>
             <p className="mt-6">Team contacts are responsible for obtaining consent from minors’ parents/guardians. If the team contact is under 18, they are responsible for themselves and their team. Parent/guardian requests for deletion of minor data are promptly honored.</p>
           </div>

          {/* ... Continue for all other sections ... */}
          <div id="privacy-rights" className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">6. YOUR PRIVACY RIGHTS</h2>
            <div className="my-6 p-4 border-l-4 border-amber-400 bg-slate-50 rounded-r-lg">
              <p className="text-slate-800"><strong>In Short:</strong> You may access, correct, delete, or manage how your personal information is used.</p>
            </div>
            <p className="mt-6">You have the right to:</p>
            <ul role="list" className="mt-4 space-y-2 text-slate-600 list-disc pl-5">
                <li><strong>Access & Correction:</strong> Request access to or correction of your data.</li>
                <li><strong>Deletion:</strong> Request removal of your personal information.</li>
                <li><strong>Opting Out:</strong> You may opt out of marketing emails and newsletters.</li>
            </ul>
            <p className="mt-4">To exercise these rights, contact the privacy team at <a href="mailto:kotp.football@gmail.com" className="font-semibold text-amber-600 hover:text-amber-500">kotp.football@gmail.com</a> or <a href="tel:+61481269391" className="font-semibold text-amber-600 hover:text-amber-500">+61 481 269 391</a>.</p>
          </div>

          <div id="australia-rights" className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">7. PRIVACY RIGHTS FOR AUSTRALIA</h2>
            <div className="my-6 p-4 border-l-4 border-amber-400 bg-slate-50 rounded-r-lg">
              <p className="text-slate-800"><strong>In Short:</strong> Your data is protected under the Privacy Act 1988 (Cth) and Australian Privacy Principles (APPs).</p>
            </div>
            <p className="mt-6">You can request access to, or correction of, your personal information. Complaints can be made to our privacy team or the Office of the Australian Information Commissioner (OAIC). If necessary data is not provided, it may affect our ability to:</p>
            <ul role="list" className="mt-4 space-y-2 text-slate-600 list-disc pl-5">
                <li>Register your team</li>
                <li>Process payments or refunds</li>
                <li>Provide customer support</li>
            </ul>
          </div>

          <div id="updates" className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">8. UPDATES TO THIS PRIVACY POLICY</h2>
            <div className="my-6 p-4 border-l-4 border-amber-400 bg-slate-50 rounded-r-lg">
              <p className="text-slate-800"><strong>In Short:</strong> This policy may be updated from time to time.</p>
            </div>
            <p className="mt-6">Updates are indicated by a revised “Last Updated” date at the top. By completing registration, you confirm that you have read, understood, and agreed to this Privacy Policy.</p>
          </div>

          <div id="contact-info" className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">9. CONTACT INFORMATION</h2>
            <p className="mt-6">If you have questions or concerns regarding this Privacy Policy, contact our privacy team:</p>
            <address className="mt-4 not-italic">
              <strong>Email:</strong> <a href="mailto:kotp.football@gmail.com" className="font-semibold text-amber-600 hover:text-amber-500">kotp.football@gmail.com</a><br/>
              <strong>Phone:</strong> <a href="tel:+61481269391" className="font-semibold text-amber-600 hover:text-amber-500">+61 481 269 391</a><br/>
              <strong>Postal Address:</strong><br />
              King of the Pitch<br />
              Privacy Team<br />
              20 Lorikeet Street<br />
              Glenwood NSW 2768<br />
              Australia
            </address>
          </div>

          <div id="data-review" className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">10. DATA REVIEW, UPDATE, AND DELETION</h2>
            <div className="my-6 p-4 border-l-4 border-amber-400 bg-slate-50 rounded-r-lg">
              <p className="text-slate-800"><strong>In Short:</strong> You can request access, updates, or deletion of your personal information.</p>
            </div>
            <p className="mt-6">All requests are handled manually by the King of the Pitch privacy team. To submit a request, please email <a href="mailto:kotp.football@gmail.com" className="font-semibold text-amber-600 hover:text-amber-500">kotp.football@gmail.com</a> or call <a href="tel:+61481269391" className="font-semibold text-amber-600 hover:text-amber-500">+61 481 269 391</a>. Requests are handled promptly. Parent/guardian requests for the deletion of a minor's data are also honored promptly.</p>
          </div>

        </div>
      </div>
    </div>
  );
}