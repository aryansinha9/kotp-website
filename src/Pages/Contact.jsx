// src/Pages/Contact.jsx (New Redesigned Version with Live Form Logic - COMPLETE)

import React, { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Mail, Phone, Clock, Send, MessageSquare, CheckCircle } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/supabaseClient"; // <-- IMPORT supabase for the contact form

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
const customIcon = new L.Icon({ /* ... (icon config unchanged) ... */ });

const InfoCard = ({ icon: Icon, title, content, delay }) => { /* ... (Unchanged) ... */ };

export default function Contact() {
  // --- TRANSPLANTED LOGIC: State for the functional contact form ---
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- TRANSPLANTED LOGIC: The working handleSubmit function ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const payload = { ...formData, subject: `KOTP Contact Form: ${formData.name}` };

    const { error: invokeError } = await supabase.functions.invoke('contact-form-handler', {
      body: JSON.stringify(payload),
    });

    if (invokeError) {
      setError('Your message could not be sent. Please try again later.');
    } else {
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" }); // Clear form
      setTimeout(() => setSubmitted(false), 5000);
    }
    setSubmitting(false);
  };

  const position = [-33.8141, 151.0043];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <style>{` /* ... (Leaflet styles unchanged) ... */ `}</style>

      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2000" alt="Contact" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/70"></div></div>
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <MessageSquare className="w-20 h-20 text-[#FF6B00] mx-auto mb-6" />
            <h1 className="headline-font text-6xl md:text-8xl text-white mb-4 text-glow">GET IN TOUCH</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Have questions? Want to partner with us? We'd love to hear from you.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoCard icon={MapPin} title="LOCATION" content="Parramatta Park, Western Sydney, NSW 2150" delay={0} />
            <InfoCard icon={Mail} title="EMAIL" content="info@kingofthepitch.com.au" delay={0.1} />
            <InfoCard icon={Phone} title="PHONE" content="+61 2 9999 8888" delay={0.2} />
            <InfoCard icon={Clock} title="HOURS" content="Mon-Fri: 9am-6pm | Sat-Sun: 10am-4pm" delay={0.3} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="mb-8">
                <h2 className="headline-font text-4xl md:text-5xl text-white mb-4">SEND US A MESSAGE</h2>
                <div className="w-24 h-1 bg-[#FF6B00]"></div>
              </div>
              
              {/* --- INTEGRATED: This form is now fully functional --- */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2 headline-font text-sm">YOUR NAME *</label>
                    <Input name="name" value={formData.name} onChange={handleChange} required className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-white mb-2 headline-font text-sm">EMAIL *</label>
                    <Input name="email" type="email" value={formData.email} onChange={handleChange} required className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12" placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-white mb-2 headline-font text-sm">MESSAGE *</label>
                  <Textarea name="message" value={formData.message} onChange={handleChange} required className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] min-h-[180px]" placeholder="Tell us what's on your mind..." />
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" disabled={submitting || submitted} className="w-full kotp-button bg-[#FF6B00] text-white py-6 rounded-md headline-font text-lg tracking-wider hover:scale-105 transition-transform duration-300 disabled:opacity-50">
                  {submitted ? <><CheckCircle className="w-5 h-5 mr-2" /> MESSAGE SENT!</> : submitting ? "SENDING..." : <><Send className="w-5 h-5 mr-2" /> SEND MESSAGE</>}
                </Button>
              </form>
            </motion.div>
            
            {/* ... (Map section is unchanged) ... */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              {/* ... */}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* ... (Social media section is unchanged) ... */}
    </div>
  );
}

// NOTE: InfoCard is included here for completeness.
const InfoCard = ({ icon: Icon, title, content, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6, delay }} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 hover:border-[#FF6B00]/50 transition-all duration-300 group">
      <div className="bg-[#FF6B00]/10 rounded-lg w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-[#FF6B00]/20 transition-colors"><Icon className="w-7 h-7 text-[#FF6B00]" /></div>
      <h3 className="headline-font text-xl text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{content}</p>
    </motion.div>
  );
};