import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react";

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

export default function PrivacyPolicy() {
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
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="headline-font text-5xl md:text-7xl text-white mb-4">
            PRIVACY POLICY
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
              At King of the Pitch ("KOTP," "we," "us," or "our"), we respect your privacy and are committed
              to protecting your personal information. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit our website or participate in our
              tournaments and programs.
            </p>
          </div>

          <Section icon={Database} title="INFORMATION WE COLLECT">
            <div>
              <h3 className="text-white font-semibold mb-2">Personal Information</h3>
              <p className="mb-3">
                We collect information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Register for tournaments or academy programs</li>
                <li>Create an account on our website</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us through our contact form</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p className="mt-3">
                This may include: full name, email address, phone number, date of birth, emergency contact
                information, and payment information.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Automatically Collected Information</h3>
              <p>
                When you visit our website, we automatically collect certain information about your device,
                including IP address, browser type, operating system, access times, and pages viewed. We use
                cookies and similar tracking technologies to enhance your experience.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Photos and Videos</h3>
              <p>
                During tournaments and events, we may capture photographs and videos for promotional purposes.
                Participation in our events constitutes consent for such media usage, unless you specifically
                opt out in writing.
              </p>
            </div>
          </Section>

          <Section icon={Eye} title="HOW WE USE YOUR INFORMATION">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Process tournament registrations and manage event participation</li>
              <li>Communicate with you about programs, events, and updates</li>
              <li>Process payments and prevent fraudulent transactions</li>
              <li>Improve our website and services</li>
              <li>Send promotional materials and newsletters (with your consent)</li>
              <li>Comply with legal obligations and protect our rights</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Analyze usage patterns and optimize user experience</li>
            </ul>
          </Section>

          <Section icon={Lock} title="HOW WE PROTECT YOUR INFORMATION">
            <p>
              We implement appropriate technical and organizational security measures to protect your personal
              information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Secure Socket Layer (SSL) encryption for data transmission</li>
              <li>Secure servers and databases with restricted access</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection practices</li>
              <li>Strict access controls and authentication procedures</li>
            </ul>
            <p className="mt-3">
              However, no method of transmission over the Internet or electronic storage is 100% secure.
              While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </Section>

          <Section icon={UserCheck} title="SHARING YOUR INFORMATION">
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your
              information with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Service Providers:</strong> Third-party vendors who assist with payment processing,
                email delivery, website hosting, and analytics
              </li>
              <li>
                <strong>Event Partners:</strong> Sponsors and venue partners necessary for tournament operations
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights
                and safety
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
              </li>
            </ul>
            <p className="mt-3">
              All third-party service providers are required to maintain the confidentiality and security of
              your information.
            </p>
          </Section>

          <Section icon={FileText} title="YOUR RIGHTS AND CHOICES">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Access:</strong> Request a copy of the personal information we hold about you
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or incomplete information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)
              </li>
              <li>
                <strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time
              </li>
              <li>
                <strong>Object:</strong> Object to certain processing activities
              </li>
              <li>
                <strong>Data Portability:</strong> Request transfer of your data to another service
              </li>
            </ul>
            <p className="mt-3">
              To exercise these rights, please contact us at privacy@kingofthepitch.com.au
            </p>
          </Section>

          <Section icon={Database} title="COOKIES AND TRACKING">
            <p>
              We use cookies and similar technologies to improve your browsing experience, analyze site traffic,
              and personalize content. You can control cookies through your browser settings. Types of cookies we use:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for website functionality</li>
              <li><strong>Performance Cookies:</strong> Help us understand how visitors use our site</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Marketing Cookies:</strong> Track your activity to deliver relevant advertising</li>
            </ul>
          </Section>

          <Section icon={UserCheck} title="CHILDREN'S PRIVACY">
            <p>
              Many of our participants are under 18 years of age. We take special care to protect the privacy
              of minors. Parents or legal guardians must provide consent for registration and participation.
              We do not knowingly collect personal information from children under 13 without parental consent.
            </p>
            <p>
              Parents have the right to review, delete, or refuse further collection of their child's information
              by contacting us directly.
            </p>
          </Section>

          <Section icon={Shield} title="CHANGES TO THIS POLICY">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal
              requirements. We will notify you of any material changes by posting the new policy on this page
              and updating the "Last Updated" date. Continued use of our services after changes constitutes
              acceptance of the updated policy.
            </p>
          </Section>

          <Section icon={FileText} title="CONTACT US">
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
              please contact us:
            </p>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 mt-4">
              <p className="text-white font-semibold mb-2">King of the Pitch</p>
              <p>Email: privacy@kingofthepitch.com.au</p>
              <p>Phone: +61 2 9999 8888</p>
              <p>Address: Parramatta Park, Western Sydney, NSW 2150</p>
            </div>
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