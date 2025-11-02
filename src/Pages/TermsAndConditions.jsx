// src/Pages/TermsAndConditions.jsx (New Redesigned Version with Official Content)

import React from "react";
import { motion } from "framer-motion";
import { FileText, AlertCircle, Shield, Users, CreditCard, Scale, Camera } from "lucide-react";

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

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
          <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C00] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6"><Scale className="w-10 h-10 text-white" /></div>
          <h1 className="headline-font text-5xl md:text-7xl text-white mb-4">TERMS & CONDITIONS</h1>
          <p className="text-gray-400 text-lg">Last Updated: [Insert Date]</p>
          <div className="w-32 h-1 bg-[#FF6B00] mx-auto mt-6"></div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 md:p-12">
          <div className="mb-12">
            <p className="text-gray-300 text-lg leading-relaxed">
              By registering, attending, or participating in any KOTP (King of the Pitch) soccer tournaments hosted at Ultimate Soccer, you agree to the following Terms and Conditions. These terms apply to all players, spectators, coaches, and visitors.
            </p>
          </div>

          <Section icon={FileText} title="1. Conditions of Entry">
            <p>All persons entering the premises of Ultimate Soccer accept full responsibility for any injury or illness. You release and discharge KOTP from any claim or cost related to your participation. Use of the facilities is at your own risk.</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Climbing on fences or netting is prohibited.</li>
                <li>No alcohol, food, or glass bottles are allowed on the pitch.</li>
                <li>Smoking is prohibited in all facility areas.</li>
                <li>Intoxicated persons will not be allowed to play.</li>
                <li>Children under 16 must be supervised by an adult.</li>
                <li>By entering, you consent to being photographed and recorded for promotional purposes.</li>
            </ul>
          </Section>

          <Section icon={Users} title="2. Registration Requirements">
            <p>All teams must register through the official KOTP system. You confirm that all information provided is true and accurate. Registration is not confirmed until the required fee is paid in full.</p>
          </Section>

          <Section icon={CreditCard} title="3. Fees & Payments">
            <p>A fixed registration fee applies to all teams and must be paid in full to confirm participation. Fees are non-transferable unless approved by KOTP.</p>
          </Section>

          <Section icon={AlertCircle} title="4. Refunds & Cancellations">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Player/Team Cancellations:</strong> No refunds will be issued for cancellations made by players or teams.</li>
              <li><strong>Event Cancellations by KOTP:</strong> A full refund will be issued to all registered teams.</li>
              <li><strong>Event Postponements:</strong> Registrations automatically transfer to the new date. You may request a refund within 7 days of the new date announcement if you are unable to attend.</li>
            </ul>
          </Section>

          <Section icon={Camera} title="5. Media Consent">
            <p>By attending any KOTP event, you consent to photographs, videos, and audio recordings being taken and used across KOTP websites, social media, and promotional materials. KOTP retains full rights to all media content.</p>
          </Section>

          <Section icon={Shield} title="6. Liability">
            <p>Participation in KOTP tournaments and use of Ultimate Soccer facilities is at your own risk. KOTP is not liable for injuries, illnesses, or personal property loss before, during, or after events.</p>
          </Section>

          <Section icon={FileText} title="7. Acceptance">
            <p>By registering via the KOTP website and/or participating in KOTP events, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.</p>
          </Section>

          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-[#FF6B00] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-2">Important Notice</p>
                  <p className="text-gray-400 text-sm">
                    By registering for any KOTP event or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions in their entirety.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}