// src/Pages/SizingGuide.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function SizingGuide() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5 }} 
                className="text-center p-8 max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl"
            >
                <h1 className="headline-font text-5xl md:text-7xl text-white mb-4 text-glow">SIZING GUIDE</h1>
                <div className="w-24 h-1 bg-[#FF6B00] mx-auto mb-6"></div>
                
                <h2 className="headline-font text-3xl text-white mb-4">COMING SOON</h2>
                <p className="text-gray-400 text-lg mb-8">
                    We are currently finalizing our official King of the Pitch apparel sizing dimensions. 
                    Please check back soon for the complete table.
                </p>
                
                <button 
                    onClick={() => window.close()} 
                    className="kotp-button bg-transparent border-2 border-white/20 text-white px-8 py-3 rounded-md headline-font tracking-wider hover:bg-white/10 transition-colors"
                >
                    CLOSE WINDOW
                </button>
            </motion.div>
        </div>
    );
}
