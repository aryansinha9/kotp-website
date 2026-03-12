// src/Components/ui/SizingGuideModal.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

export default function SizingGuideModal({ isOpen, onClose }) {
  const [activeSize, setActiveSize] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      setActiveSize(null);
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const sizes = ["4Y", "6Y", "8Y", "10Y", "12Y", "14Y", "16Y"];

  const jerseyMeasurements = [
    { label: "Chest 1/2 (A)", values: [36, 38, 40, 42, 44, 46, 49] },
    { label: "Length (B)", values: [52, 54, 56, 59, 61, 63, 65] }
  ];

  const shortsMeasurements = [
    { label: "1. Length (incl. waist)", values: [28.5, 30.5, 33.5, 36, 38, 40, 41.5] },
    { label: "2. Waist 1/2", values: [26, 27, 28, 29, 30, 32, 34] },
    { label: "3. Leg Opening 1/2", values: [20, 22.5, 23.5, 24.5, 26, 26.5, 28] }
  ];

  const isColHighlighted = (index) => activeSize === index || hoverIndex === index;

  const DownloadButton = () => (
    <a 
      href="/JOGA_KIDS_-_JERSEY_AND_SHORTS_SIZE_CHART_2026.pdf" 
      download="JOGA_Kids_Size_Chart_2026.pdf" 
      className="kotp-button inline-flex items-center gap-2 bg-[#FF6B00] text-white px-6 py-3 rounded-md headline-font text-xl tracking-wider hover:bg-[#FF6B00]/90 transition-colors w-full sm:w-auto justify-center"
    >
      <Download className="w-5 h-5" /> Download Size Chart PDF
    </a>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto p-4 sm:p-6">
          {/* Dimmed Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0a0a0a]">
              <h2 className="headline-font text-3xl md:text-5xl text-white tracking-wide">JOGA KIDS SIZING GUIDE</h2>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-12 pb-12 custom-scrollbar">
              
              <div className="flex justify-center sm:justify-start">
                <DownloadButton />
              </div>

              {/* Size Selector */}
              <div className="space-y-3">
                <h3 className="text-gray-400 font-semibold tracking-wider text-sm uppercase">Select Size to Highlight:</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size, index) => (
                    <button
                      key={size}
                      onClick={() => setActiveSize(activeSize === index ? null : index)}
                      className={`px-4 py-2 rounded font-bold transition-colors ${activeSize === index ? 'bg-[#FF6B00] text-white' : 'bg-white/5 text-gray-300 hover:bg-white/15'}`}
                    >
                      {size}
                    </button>
                  ))}
                  {activeSize !== null && (
                    <button 
                      onClick={() => setActiveSize(null)} 
                      className="px-4 py-2 rounded font-bold text-gray-500 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* JERSEY SECTION */}
              <div className="space-y-6">
                <h3 className="headline-font text-3xl text-white border-b border-[#FF6B00]/30 pb-2 inline-block">JERSEY CHART (CM)</h3>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* SVG Illustration */}
                  <div className="group w-full md:w-1/3 flex justify-center bg-white/5 rounded-lg p-6 border border-white/5">
                    <svg viewBox="0 0 100 100" className="w-48 h-48 transform transition-transform duration-500 group-hover:scale-105">
                      {/* T-Shirt Silhouette */}
                      <path d="M25,15 L35,15 C40,20 60,20 65,15 L75,15 L95,40 L80,55 L75,45 L75,85 L25,85 L25,45 L20,55 L5,40 Z" fill="#1a1a1a" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
                      {/* Chest Line (A) */}
                      <line x1="25" y1="47" x2="75" y2="47" stroke="#FF6B00" strokeWidth="2" strokeDasharray="4" className="opacity-50 group-hover:opacity-100 transition-opacity" />
                      <text x="44" y="44" fill="#FF6B00" fontSize="8" fontWeight="bold" textAnchor="start" className="font-sans">A (Chest)</text>
                      {/* Length Line (B) */}
                      <line x1="40" y1="18" x2="40" y2="85" stroke="#FF6B00" strokeWidth="2" strokeDasharray="4" className="opacity-50 group-hover:opacity-100 transition-opacity" />
                      <text x="50" y="97" fill="#FF6B00" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-sans">B (Length)</text>
                    </svg>
                  </div>

                  {/* Table */}
                  <div className="w-full md:w-2/3 overflow-x-auto rounded-lg border border-white/10">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-[#1a1a1a]">
                          <th className="p-4 font-bold text-gray-400 whitespace-nowrap">SIZE</th>
                          {sizes.map((size, index) => (
                            <th 
                              key={size} 
                              onMouseEnter={() => setHoverIndex(index)}
                              onMouseLeave={() => setHoverIndex(null)}
                              className={`p-4 font-bold text-center transition-colors duration-200 ${isColHighlighted(index) ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'text-white'}`}
                            >
                              {size}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {jerseyMeasurements.map((row) => (
                          <tr key={row.label} className="border-t border-white/5 hover:bg-white/5 transition-colors group/row">
                            <td className="p-4 font-medium text-gray-300 whitespace-nowrap">{row.label}</td>
                            {row.values.map((val, index) => (
                              <td 
                                key={index} 
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                                className={`p-4 font-medium text-center transition-colors duration-200 ${isColHighlighted(index) ? 'bg-[#FF6B00]/20 text-white' : 'text-gray-400 group-hover/row:text-gray-200'}`}
                              >
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* SHORTS SECTION */}
              <div className="space-y-6 pt-6 border-t border-white/10">
                <h3 className="headline-font text-3xl text-white border-b border-[#FF6B00]/30 pb-2 inline-block">SHORTS CHART (CM)</h3>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* SVG Illustration */}
                  <div className="group w-full md:w-1/3 flex justify-center bg-white/5 rounded-lg p-6 border border-white/5">
                    <svg viewBox="0 0 100 100" className="w-48 h-48 transform transition-transform duration-500 group-hover:scale-105">
                      {/* Shorts Silhouette */}
                      <path d="M30,20 L70,20 C75,20 80,25 85,35 L90,80 L55,85 L50,60 L45,85 L10,80 L15,35 C20,25 25,20 30,20 Z" fill="#1a1a1a" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
                      {/* Waistband (2) */}
                      <line x1="30" y1="25" x2="70" y2="25" stroke="#FF6B00" strokeWidth="2" strokeDasharray="4" className="opacity-50 group-hover:opacity-100 transition-opacity" />
                      <text x="50" y="21" fill="#FF6B00" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-sans">2 (Waist)</text>
                      {/* Length (1) */}
                      <line x1="78" y1="20" x2="85" y2="80" stroke="#FF6B00" strokeWidth="2" strokeDasharray="4" className="opacity-50 group-hover:opacity-100 transition-opacity" />
                      <text x="96" y="55" fill="#FF6B00" fontSize="8" fontWeight="bold" textAnchor="end" className="font-sans">1 (Length)</text>
                      {/* Leg Opening (3) */}
                      <line x1="55" y1="83" x2="88" y2="78" stroke="#FF6B00" strokeWidth="2" strokeDasharray="4" className="opacity-50 group-hover:opacity-100 transition-opacity" />
                      <text x="75" y="92" fill="#FF6B00" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-sans">3 (Leg)</text>
                    </svg>
                  </div>

                  {/* Table */}
                  <div className="w-full md:w-2/3 overflow-x-auto rounded-lg border border-white/10">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-[#1a1a1a]">
                          <th className="p-4 font-bold text-gray-400 whitespace-nowrap">SIZE</th>
                          {sizes.map((size, index) => (
                            <th 
                              key={size} 
                              onMouseEnter={() => setHoverIndex(index)}
                              onMouseLeave={() => setHoverIndex(null)}
                              className={`p-4 font-bold text-center transition-colors duration-200 ${isColHighlighted(index) ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'text-white'}`}
                            >
                              {size}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {shortsMeasurements.map((row) => (
                          <tr key={row.label} className="border-t border-white/5 hover:bg-white/5 transition-colors group/row">
                            <td className="p-4 font-medium text-gray-300 whitespace-nowrap">{row.label}</td>
                            {row.values.map((val, index) => (
                              <td 
                                key={index} 
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                                className={`p-4 font-medium text-center transition-colors duration-200 ${isColHighlighted(index) ? 'bg-[#FF6B00]/20 text-white' : 'text-gray-400 group-hover/row:text-gray-200'}`}
                              >
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <p className="text-gray-500 text-sm max-w-lg text-center md:text-left leading-relaxed">
                  All measurements are in centimetres (cm). These are garment measurements, not body measurements. For assistance, contact JOGA.
                </p>
                <DownloadButton />
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
