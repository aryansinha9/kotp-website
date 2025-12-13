import React from "react";
import { motion } from "framer-motion";
import { FileText, AlertCircle, Shield, Users, CreditCard, Scale } from "lucide-react";

const Section = ({ icon: Icon, title, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-[#FF6B00]/10 rounded-lg p-3 flex-shrink-0">
          <Icon className="w-6 h-6 text-[#FF6B00]" />
        </div>
        <h2 className="headline-font text-3xl text-white">{title}</h2>
      </div>
      <div className="text-gray-400 leading-relaxed space-y-4 pl-16">
        {children}
      </div>
    </motion.div>
  );
};

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C00] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="headline-font text-5xl md:text-7xl text-white mb-4">
            TERMS & CONDITIONS
          </h1>
          <p className="text-gray-400 text-lg">
            Last Updated: January 2025
          </p>
          <div className="w-32 h-1 bg-[#FF6B00] mx-auto mt-6"></div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 md:p-12"
        >
          <div className="mb-12">
            <p className="text-gray-300 text-lg leading-relaxed">
              Welcome to King of the Pitch ("KOTP," "we," "us," or "our"). These Terms and Conditions 
              ("Terms") govern your access to and use of our website, programs, tournaments, and services. 
              By accessing or using our services, you agree to be bound by these Terms. If you do not agree, 
              please do not use our services.
            </p>
          </div>

          <Section icon={FileText} title="ACCEPTANCE OF TERMS">
            <p>
              By registering for any KOTP tournament, academy program, or event, or by using our website, 
              you acknowledge that you have read, understood, and agree to be bound by these Terms and our 
              Privacy Policy. If you are under 18 years of age, your parent or legal guardian must review 
              and accept these Terms on your behalf.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately 
              upon posting to our website. Your continued use of our services constitutes acceptance of the 
              modified Terms.
            </p>
          </Section>

          <Section icon={Users} title="REGISTRATION & ELIGIBILITY">
            <div>
              <h3 className="text-white font-semibold mb-2">Tournament Registration</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All registrations must be completed through our official website or authorized channels</li>
                <li>You must provide accurate, current, and complete information during registration</li>
                <li>Participants must meet age and division requirements for their chosen tournament</li>
                <li>Parents/guardians must consent for participants under 18 years of age</li>
                <li>We reserve the right to verify eligibility and reject registrations that do not meet requirements</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Account Responsibility</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for 
                all activities that occur under your account. You agree to notify us immediately of any 
                unauthorized use of your account.
              </p>
            </div>
          </Section>

          <Section icon={CreditCard} title="FEES & PAYMENT">
            <div>
              <h3 className="text-white font-semibold mb-2">Registration Fees</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All fees must be paid in full at the time of registration unless otherwise specified</li>
                <li>Fees are quoted in Australian Dollars (AUD)</li>
                <li>Payment can be made via credit card, debit card, or other approved methods</li>
                <li>A valid payment method must be provided to complete registration</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Refund Policy</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cancellations made more than 30 days before the event: 80% refund</li>
                <li>Cancellations made 15-30 days before the event: 50% refund</li>
                <li>Cancellations made less than 15 days before the event: No refund</li>
                <li>KOTP-initiated cancellations: Full refund provided</li>
                <li>No refunds for no-shows or voluntary withdrawals after the event starts</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Late Payments</h3>
              <p>
                Failure to pay fees by the specified deadline may result in cancellation of your registration 
                without refund. We reserve the right to refuse services to those with outstanding balances.
              </p>
            </div>
          </Section>

          <Section icon={Shield} title="CODE OF CONDUCT">
            <p>All participants, parents, guardians, and spectators must:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Treat all participants, officials, staff, and spectators with respect</li>
              <li>Follow all rules and regulations of the tournament or program</li>
              <li>Refrain from violent, abusive, or discriminatory behavior</li>
              <li>Comply with all safety protocols and instructions from KOTP staff</li>
              <li>Not use performance-enhancing substances or engage in cheating</li>
              <li>Not bring weapons, illegal substances, or prohibited items to events</li>
              <li>Respect venue property and facilities</li>
            </ul>
            <p className="mt-3 text-[#FF6B00]">
              Violation of the Code of Conduct may result in immediate disqualification, removal from the 
              event, and ban from future KOTP programs without refund.
            </p>
          </Section>

          <Section icon={AlertCircle} title="LIABILITY & ASSUMPTION OF RISK">
            <div>
              <h3 className="text-white font-semibold mb-2">Assumption of Risk</h3>
              <p>
                Participation in football activities involves inherent risks, including but not limited to 
                physical injury, illness, or death. By participating, you acknowledge these risks and voluntarily 
                assume all responsibility for any injuries or damages that may occur.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Release of Liability</h3>
              <p>
                To the fullest extent permitted by law, you release and hold harmless KOTP, its officers, 
                directors, employees, volunteers, sponsors, and affiliates from any and all claims, demands, 
                damages, or liability arising from your participation in our programs, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Personal injury or property damage</li>
                <li>Accidents or injuries during travel to or from events</li>
                <li>Losses due to theft or damage to personal property</li>
                <li>Negligence of other participants or third parties</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Insurance</h3>
              <p>
                KOTP maintains general liability insurance for our events. However, participants are strongly 
                encouraged to maintain their own personal health and accident insurance. KOTP is not responsible 
                for medical expenses incurred due to injuries sustained during participation.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Medical Emergencies</h3>
              <p>
                In the event of a medical emergency, you authorize KOTP staff to seek medical treatment on 
                your behalf (or your child's behalf). You agree to be financially responsible for all medical 
                expenses incurred.
              </p>
            </div>
          </Section>

          <Section icon={FileText} title="MEDIA RIGHTS">
            <p>
              By participating in KOTP events, you grant us the irrevocable right to use, reproduce, and 
              distribute photographs, videos, audio recordings, and other media featuring your likeness or 
              performance for promotional, marketing, and educational purposes, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Website and social media content</li>
              <li>Marketing materials and advertisements</li>
              <li>Highlight reels and promotional videos</li>
              <li>Print publications and press releases</li>
            </ul>
            <p className="mt-3">
              If you wish to opt out of media usage, you must submit a written request to 
              media@kingofthepitch.com.au prior to the event.
            </p>
          </Section>

          <Section icon={Scale} title="INTELLECTUAL PROPERTY">
            <p>
              All content on our website and materials, including but not limited to logos, designs, text, 
              graphics, software, and images, are the property of KOTP or our licensors and are protected by 
              copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, or create derivative works from our content without 
              our express written permission. The KOTP name, logo, and all related marks are trademarks of 
              King of the Pitch.
            </p>
          </Section>

          <Section icon={AlertCircle} title="EVENT MODIFICATIONS & CANCELLATIONS">
            <p>KOTP reserves the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modify event dates, times, locations, or formats due to weather, safety, or logistical reasons</li>
              <li>Cancel or postpone events with reasonable notice</li>
              <li>Combine or separate divisions based on registration numbers</li>
              <li>Make rule changes or adjustments to ensure fair competition</li>
              <li>Eject participants for violations of these Terms or the Code of Conduct</li>
            </ul>
            <p className="mt-3">
              In the event of KOTP-initiated cancellation, registered participants will receive a full refund 
              or credit toward a future event. We are not responsible for travel, accommodation, or other 
              expenses incurred by participants.
            </p>
          </Section>

          <Section icon={Shield} title="LIMITATION OF LIABILITY">
            <p>
              To the maximum extent permitted by law, KOTP's total liability for any claims arising from or 
              related to our services shall not exceed the amount of fees paid by you for the specific event 
              or service giving rise to the claim.
            </p>
            <p>
              KOTP shall not be liable for any indirect, incidental, consequential, special, or punitive 
              damages, including but not limited to loss of profits, data, or goodwill, whether in contract, 
              tort, or otherwise, even if advised of the possibility of such damages.
            </p>
          </Section>

          <Section icon={FileText} title="GOVERNING LAW & DISPUTES">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of New South Wales, 
              Australia, without regard to conflict of law principles. Any disputes arising from these Terms 
              or your use of our services shall be subject to the exclusive jurisdiction of the courts of 
              New South Wales.
            </p>
            <p>
              In the event of any dispute, you agree to first attempt to resolve the matter informally by 
              contacting us directly. If informal resolution is unsuccessful, you agree to submit to binding 
              arbitration in accordance with Australian arbitration law.
            </p>
          </Section>

          <Section icon={Users} title="SEVERABILITY">
            <p>
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining 
              provisions shall continue in full force and effect. The invalid provision shall be modified to 
              the minimum extent necessary to make it valid and enforceable.
            </p>
          </Section>

          <Section icon={FileText} title="CONTACT INFORMATION">
            <p>
              If you have questions or concerns about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 mt-4">
              <p className="text-white font-semibold mb-2">King of the Pitch</p>
              <p>Email: legal@kingofthepitch.com.au</p>
              <p>Phone: +61 2 9999 8888</p>
              <p>Address: Parramatta Park, Western Sydney, NSW 2150</p>
            </div>
          </Section>

          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-[#FF6B00] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-2">Important Notice</p>
                  <p className="text-gray-400 text-sm">
                    By registering for any KOTP event or using our services, you acknowledge that you have 
                    read, understood, and agree to be bound by these Terms and Conditions in their entirety. 
                    If you are registering a minor, you represent that you are their parent or legal guardian 
                    and have the authority to agree to these Terms on their behalf.
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
