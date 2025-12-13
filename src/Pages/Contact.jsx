import React, { useState } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Mail, Phone, Clock, Send, MessageSquare } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useRef } from "react";
import L from "leaflet";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom orange marker
const customIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const InfoCard = ({ icon: Icon, title, content, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 hover:border-[#FF6B00]/50 transition-all duration-300 group"
    >
      <div className="bg-[#FF6B00]/10 rounded-lg w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-[#FF6B00]/20 transition-colors">
        <Icon className="w-7 h-7 text-[#FF6B00]" />
      </div>
      <h3 className="headline-font text-xl text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{content}</p>
    </motion.div>
  );
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    }, 3000);
  };

  // Parramatta Park coordinates (Western Sydney)
  const position = [-33.8141, 151.0043];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <style>{`
        .leaflet-container {
          background: #0a0a0a;
        }
        
        .leaflet-tile {
          filter: grayscale(100%) invert(100%) contrast(80%) brightness(0.7);
        }
        
        .leaflet-popup-content-wrapper {
          background: #1a1a1a;
          color: white;
          border: 1px solid rgba(255, 107, 0, 0.3);
        }
        
        .leaflet-popup-tip {
          background: #1a1a1a;
        }
        
        .leaflet-control-attribution {
          background: rgba(26, 26, 26, 0.8) !important;
          color: #666 !important;
        }
        
        .leaflet-control-attribution a {
          color: #FF6B00 !important;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2000"
            alt="Contact"
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
            <MessageSquare className="w-20 h-20 text-[#FF6B00] mx-auto mb-6" />
            <h1 className="headline-font text-6xl md:text-8xl text-white mb-4 text-glow">
              GET IN TOUCH
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions? Want to partner with us? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoCard
              icon={MapPin}
              title="LOCATION"
              content="Parramatta Park, Western Sydney, NSW 2150"
              delay={0}
            />
            <InfoCard
              icon={Mail}
              title="EMAIL"
              content="info@kingofthepitch.com.au"
              delay={0.1}
            />
            <InfoCard
              icon={Phone}
              title="PHONE"
              content="+61 2 9999 8888"
              delay={0.2}
            />
            <InfoCard
              icon={Clock}
              title="HOURS"
              content="Mon-Fri: 9am-6pm | Sat-Sun: 10am-4pm"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Form + Map Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <h2 className="headline-font text-4xl md:text-5xl text-white mb-4">
                  SEND US A MESSAGE
                </h2>
                <div className="w-24 h-1 bg-[#FF6B00]"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2 headline-font text-sm">
                      YOUR NAME *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12"
                      placeholder="Full name"
                    />
                  </div>
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
                      className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2 headline-font text-sm">
                      PHONE
                    </label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12"
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 headline-font text-sm">
                      SUBJECT *
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12"
                      placeholder="What's this about?"
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
                    className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] min-h-[180px]"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitted}
                  className="w-full kotp-button bg-[#FF6B00] text-white py-6 rounded-md headline-font text-lg tracking-wider hover:scale-105 transition-transform duration-300 disabled:opacity-50"
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

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <h2 className="headline-font text-4xl md:text-5xl text-white mb-4">
                  FIND US HERE
                </h2>
                <div className="w-24 h-1 bg-[#FF6B00]"></div>
              </div>

              <div className="relative h-[500px] rounded-lg overflow-hidden border-2 border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300">
                <MapContainer
                  center={position}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={position} icon={customIcon}>
                    <Popup>
                      <div className="p-2">
                        <p className="headline-font text-[#FF6B00] text-lg mb-1">
                          KING OF THE PITCH
                        </p>
                        <p className="text-sm text-gray-300">
                          Parramatta Park<br />
                          Western Sydney, NSW
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Map Info */}
              <div className="mt-6 bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
                <h3 className="headline-font text-xl text-white mb-3">DIRECTIONS</h3>
                <p className="text-gray-400 mb-4">
                  Located in the heart of Western Sydney, easily accessible by car or public transport.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Parramatta+Park+NSW"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] px-4 py-2 rounded-md hover:bg-[#FF6B00]/20 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="headline-font text-sm">GET DIRECTIONS</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="headline-font text-4xl md:text-5xl text-white mb-6">
              FOLLOW THE KINGDOM
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Stay updated with the latest news, highlights, and tournament announcements
            </p>
            <div className="flex justify-center gap-6">
              <a
                href="#"
                className="w-14 h-14 bg-[#1a1a1a] border border-white/10 rounded-lg flex items-center justify-center hover:border-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all duration-300 group"
              >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FF6B00]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-14 h-14 bg-[#1a1a1a] border border-white/10 rounded-lg flex items-center justify-center hover:border-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all duration-300 group"
              >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FF6B00]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-14 h-14 bg-[#1a1a1a] border border-white/10 rounded-lg flex items-center justify-center hover:border-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all duration-300 group"
              >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FF6B00]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-14 h-14 bg-[#1a1a1a] border border-white/10 rounded-lg flex items-center justify-center hover:border-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all duration-300 group"
              >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FF6B00]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}