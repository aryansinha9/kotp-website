import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Eye, Heart, Star, Send, Building2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ValueCard = ({ icon: Icon, title, description, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <div className="bg-[#FF6B00]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#FF6B00]/20 transition-colors">
        <Icon className="w-10 h-10 text-[#FF6B00]" />
      </div>
      <h3 className="headline-font text-2xl text-white mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
};

const SponsorTier = ({ tier, sponsors, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="mb-12"
    >
      <div className="text-center mb-8">
        <h3 className="headline-font text-3xl md:text-4xl text-white mb-2">{tier}</h3>
        <div className="w-24 h-1 bg-[#FF6B00] mx-auto"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {sponsors.map((sponsor, idx) => (
          <div
            key={idx}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 flex items-center justify-center hover:border-[#FF6B00]/50 transition-all duration-300 group"
          >
            <div className="text-center">
              <Building2 className="w-12 h-12 text-gray-600 group-hover:text-[#FF6B00] transition-colors mx-auto mb-3" />
              <p className="text-gray-500 text-sm headline-font">{sponsor}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function Sponsors() {
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const partnershipValues = [
    {
      icon: Eye,
      title: "UNMATCHED VISIBILITY",
      description: "Your brand showcased across all our tournaments, academy sessions, and digital platforms reaching thousands of engaged athletes and families."
    },
    {
      icon: Heart,
      title: "AUTHENTIC CONNECTION",
      description: "Associate with a movement that's genuinely transforming Western Sydney's youth through sport, discipline, and opportunity."
    },
    {
      icon: Star,
      title: "ASSOCIATE WITH GREATNESS",
      description: "Align your brand with excellence, competition, and the champions of tomorrow in Australia's fastest-growing street football scene."
    }
  ];

  const sponsorTiers = [
    {
      tier: "TITLE PARTNERS",
      sponsors: ["PARTNER 1", "PARTNER 2"]
    },
    {
      tier: "PLATINUM PARTNERS",
      sponsors: ["PARTNER 3", "PARTNER 4", "PARTNER 5", "PARTNER 6"]
    },
    {
      tier: "COMMUNITY PARTNERS",
      sponsors: ["PARTNER 7", "PARTNER 8", "PARTNER 9", "PARTNER 10"]
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000"
            alt="Partnership"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_2q2yk2q2yk2q2yk2-Photoroom.svg" alt="Trophy" className="w-20 h-20 mx-auto mb-6" />
            <h1 className="headline-font text-6xl md:text-8xl text-white mb-4 text-glow">
              JOIN THE KINGDOM.
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Partner with Western Sydney's most dynamic football movement
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">
              WHY PARTNER WITH US?
            </h2>
            <div className="w-32 h-1 bg-[#FF6B00] mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {partnershipValues.map((value, index) => (
              <ValueCard key={index} {...value} delay={index * 0.2} />
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 text-center"
            >
              <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_2q2yk2q2yk2q2yk2-Photoroom.svg" alt="Trophy" className="w-24 h-24 mx-auto mb-4" />
              <div className="headline-font text-5xl text-white mb-2">50+</div>
              <p className="text-gray-400">Tournaments Hosted</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 text-center"
            >
              <Users className="w-12 h-12 text-[#FF6B00] mx-auto mb-4" />
              <div className="headline-font text-5xl text-white mb-2">5,000+</div>
              <p className="text-gray-400">Active Players</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 text-center"
            >
              <Eye className="w-12 h-12 text-[#FF6B00] mx-auto mb-4" />
              <div className="headline-font text-5xl text-white mb-2">100K+</div>
              <p className="text-gray-400">Social Media Reach</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Current Partners Section */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">
              OUR PARTNERS
            </h2>
            <div className="w-32 h-1 bg-[#FF6B00] mx-auto mb-6"></div>
            <p className="text-gray-400 text-xl">Thank you to our valued partners who support the kingdom</p>
          </motion.div>

          {sponsorTiers.map((tier, index) => (
            <SponsorTier key={index} {...tier} index={index} />
          ))}
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">
                GET IN TOUCH
              </h2>
              <div className="w-32 h-1 bg-[#FF6B00] mx-auto mb-6"></div>
              <p className="text-gray-400 text-xl">
                Ready to join the kingdom? Let's discuss how we can create greatness together.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2 headline-font text-sm">
                    COMPANY NAME *
                  </label>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00]"
                    placeholder="Your company"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 headline-font text-sm">
                    YOUR NAME *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00]"
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2 headline-font text-sm">
                    EMAIL *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00]"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 headline-font text-sm">
                    PHONE
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00]"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2 headline-font text-sm">
                  MESSAGE *
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00] min-h-[150px]"
                  placeholder="Tell us about your partnership goals..."
                />
              </div>

              <Button
                type="submit"
                className="w-full kotp-button bg-[#FF6B00] text-white py-6 rounded-md headline-font text-lg tracking-wider hover:scale-105 transition-transform duration-300"
              >
                {submitted ? (
                  "MESSAGE SENT!"
                ) : (
                  <>
                    SEND MESSAGE
                    <Send className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}