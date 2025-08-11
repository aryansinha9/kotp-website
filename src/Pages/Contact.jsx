// PASTE THIS CODE INTO: src/Pages/Contact.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const contactDetails = [
    {
      icon: <Mail className="w-6 h-6 text-amber-500" />,
      title: 'Email Us',
      value: 'info@kingofthepitch.com',
      href: 'mailto:info@kingofthepitch.com',
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
      value: 'Sydney Olympic Park, NSW 2127',
      href: 'https://www.google.com/maps/search/?api=1&query=Sydney+Olympic+Park',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="hero-gradient text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">Get In Touch</h1>
          <p className="mt-4 text-xl text-white/80">
            Have a question or want to partner with us? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Info and Form Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* Left Side: Contact Details */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Contact Information</h2>
              <div className="space-y-8">
                {contactDetails.map((detail) => (
                  <div key={detail.title} className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      {detail.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">{detail.title}</h3>
                      <a href={detail.href} target="_blank" rel="noopener noreferrer" className="text-lg text-slate-600 hover:text-amber-600 transition-colors">
                        {detail.value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 h-64 bg-slate-200 rounded-2xl">
                {/* This is a placeholder for a real map */}
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3313.882894380154!2d151.0664213152097!3d-33.84063548066378!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12a6a0d84f23a1%3A0x5017d681632a8a0!2sSydney%20Olympic%20Park!5e0!3m2!1sen!2sau!4v1678886400000"
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

            {/* Right Side: Contact Form */}
            <div className="bg-slate-50 p-8 md:p-12 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Send Us a Message</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <Input id="name" type="text" placeholder="John Doe" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <Input id="subject" type="text" placeholder="e.g., Partnership Inquiry" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <Textarea id="message" placeholder="Your message here..." rows={5} required />
                </div>
                <div>
                  <Button type="submit" size="lg" className="w-full btn-accent font-semibold text-lg">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}