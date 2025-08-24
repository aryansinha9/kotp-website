// REPLACE THE ENTIRE CONTENTS OF: src/Pages/Contact.jsx

import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const { data, error } = await supabase.functions.invoke('contact-form-handler', {
        body: JSON.stringify(formData),
      });

      if (error) { throw new Error(`Function invoke failed: ${error.message}`); }
      if (data && data.error) { throw new Error(`Sending email failed: ${data.error.message || JSON.stringify(data.error)}`); }
      
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // --- THIS IS THE SECTION WE UPDATED ---
  const contactDetails = [
    {
      icon: <Mail className="w-6 h-6 text-amber-500" />,
      title: 'Email Us',
      value: 'kotp.football@gmail.com', // <-- CORRECTED EMAIL
      href: 'mailto:kotp.football@gmail.com', // <-- CORRECTED EMAIL LINK
    },
    {
      icon: <Phone className="w-6 h-6 text-amber-500" />,
      title: 'Call Us',
      value: '+61 2 9876 5432',
      href: 'tel:+61298765432',
    },
    {
      icon: <MapPin className="w-6 h-6 text-amber-500" />,
      title: 'Main Venue',
      value: (
  <>
    Wanderers Fives
    <br />
    Football Dr, Rooty Hill NSW 2766
  </>
), // <-- CORRECTED ADDRESS
      href: 'https://www.google.com/maps/search/?api=1&query=Football+Dr,+Rooty+Hill+NSW+2766', // <-- CORRECTED MAPS LINK
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="hero-gradient text-white py-20 text-center"><div className="max-w-4xl mx-auto px-4"><h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">Get In Touch</h1><p className="mt-4 text-xl text-white/80">Have a question or want to partner with us? We'd love to hear from you.</p></div></section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Contact Information</h2>
              <div className="space-y-8">{contactDetails.map((detail) => (<div key={detail.title} className="flex items-start gap-6"><div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">{detail.icon}</div><div><h3 className="text-xl font-semibold text-slate-800">{detail.title}</h3><a href={detail.href} target="_blank" rel="noopener noreferrer" className="text-lg text-slate-600 hover:text-amber-600 transition-colors">{detail.value}</a></div></div>))}</div>
              <div className="mt-12 h-64 bg-slate-200 rounded-2xl">
                
                {/* --- THE MAP IFRAME IS UPDATED HERE --- */}
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.0247979167993!2d150.85408544666183!3d-33.77451587153432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b129b4c733a144d%3A0xa5dcda9c00918d6b!2sWanderers%20Fives!5e1!3m2!1sen!2sau!4v1755001104585!5m2!1sen!2sau"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-2xl"
                ></iframe>
              </div>
            </div>
            <div className="bg-slate-50 p-8 md:p-12 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div><label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label><Input id="name" type="text" value={formData.name} onChange={handleInputChange} required /></div>
                <div><label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} required /></div>
                <div><label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">Subject</label><Input id="subject" type="text" value={formData.subject} onChange={handleInputChange} required /></div>
                <div><label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label><Textarea id="message" value={formData.message} onChange={handleInputChange} rows={5} required /></div>
                {success && <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3"><CheckCircle className="w-5 h-5" /> <p>Message sent successfully!</p></div>}
                {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3"><AlertTriangle className="w-5 h-5" /> <p>{error}</p></div>}
                <div><Button type="submit" size="lg" className="w-full btn-accent font-semibold text-lg" disabled={submitting}>{submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}{submitting ? 'Sending...' : 'Send Message'}</Button></div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}