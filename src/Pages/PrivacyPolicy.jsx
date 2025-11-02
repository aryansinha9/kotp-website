// src/Pages/PrivacyPolicy.jsx (New Redesigned Version with Official Content)

import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, UserCheck, FileText, Users, Mail } from "lucide-react";

const Section = ({ icon: Icon, title, children }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-[#FF6B00]/10 rounded-lg p-3 flex-shrink-0"><Icon className="w-6 h-6 text-[#FF6B00]" /></div>
        <h2 className="headline-font text-3xl text-white">{title}</h2>
      </div>
      <div className="text-gray-400 leading-relaxed space-y-4 pl-16">{children}</div>
    </motion.div>
  );
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
          <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C00] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6"><Shield className="w-10 h-10 text-white" /></div>
          <h1 className="headline-font text-5xl md:text-7xl text-white mb-4">PRIVACY POLICY</h1>
          <p className="text-gray-400 text-lg">Last Updated: August 28, 2025</p>
          <div className="w-32 h-1 bg-[#FF6B00] mx-auto mt-6"></div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 md:p-12">
          <div className="mb-12">
            <p className="text-gray-300 text-lg leading-relaxed">
              This privacy notice for A&A Sporting Enterprises PTY LTD (trading as King of the Pitch, “we,” “us,” or “our”) describes how and why we collect, store, use, and share your information when you use our services (“Services”).
            </p>
          </div>

          <Section icon={Database} title="1. WHAT INFORMATION DO WE COLLECT?">
            <p>We collect personal information that you provide during tournament registration, which may include: Team name, Contact person’s name, email, and phone number, Age group or division, Registration creation date, and Payment details like status, amount paid, and Stripe session ID. We do not use Google Analytics or other tracking tools.</p>
          </Section>

          <Section icon={Eye} title="2. HOW WE USE YOUR INFORMATION">
            <p>Your information is used to manage tournament operations, communicate with participants, and send updates or promotional content. This includes organizing matches, responding to inquiries, sending newsletters, and sharing results or photos. Payments are securely processed through Stripe.</p>
          </Section>
          
          <Section icon={FileText} title="3. HOW LONG WE KEEP YOUR INFORMATION">
            <p>We keep your personal information only as long as necessary to run the tournament. Data is stored for the duration of the event and deleted afterward, though owners may optionally keep a copy. You may request deletion of your information at any time.</p>
          </Section>

          <Section icon={Lock} title="4. HOW WE KEEP YOUR INFORMATION SAFE">
            <p>We take reasonable measures to protect your data. Access is restricted via a password-protected admin dashboard, and direct database access is limited to the IT manager. We do not store credit card details. However, no system is 100% secure.</p>
          </Section>

          <Section icon={Users} title="5. DATA OF MINORS">
            <p>We do not directly collect information from children under 18. Team contacts are responsible for obtaining consent from minors’ parents/guardians. Parent/guardian requests for deletion of minor data are promptly honored.</p>
          </Section>

          <Section icon={UserCheck} title="6. YOUR PRIVACY RIGHTS">
            <p>You may access, correct, delete, or manage how your personal information is used. This includes opting out of marketing emails. To exercise these rights, please contact the privacy team using the information below.</p>
          </Section>

          <Section icon={FileText} title="7. PRIVACY RIGHTS FOR AUSTRALIA">
            <p>Your data is protected under the Privacy Act 1988 (Cth) and Australian Privacy Principles (APPs). You can request access to, or correction of, your personal information. Complaints can be made to our privacy team or the Office of the Australian Information Commissioner (OAIC).</p>
          </Section>

          <Section icon={Shield} title="8. UPDATES TO THIS PRIVACY POLICY">
            <p>This policy may be updated from time to time, indicated by the “Last Updated” date. By completing registration, you confirm that you have read, understood, and agreed to this Privacy Policy.</p>
          </Section>

          <Section icon={Mail} title="9. CONTACT INFORMATION">
             <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
               <p className="text-white font-semibold mb-2">King of the Pitch - Privacy Team</p>
               <p>Email: <a href="mailto:kotp.football@gmail.com" className="text-[#FF6B00] hover:underline">kotp.football@gmail.com</a></p>
               <p>Phone: <a href="tel:+61481269391" className="text-[#FF6B00] hover:underline">+61 481 269 391</a></p>
               <p>Address: 20 Lorikeet Street, Glenwood NSW 2768, Australia</p>
             </div>
          </Section>

          <Section icon={Database} title="10. DATA REVIEW, UPDATE, AND DELETION">
            <p>You can request access, updates, or deletion of your personal information. All requests are handled promptly by our privacy team. To submit a request, please use the contact information provided above.</p>
          </Section>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-gray-500 text-sm text-center">
              By using our website and services, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}