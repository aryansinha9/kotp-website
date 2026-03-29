import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AIAAfterSchoolProgramForm from "@/Components/AIAAfterSchoolProgramForm";

export default function AIAAfterSchoolProgram() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/academy" className="inline-flex items-center text-gray-400 hover:text-[#FF6B00] mb-8 transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to Academy
                </Link>

                {/* Header Block */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <div className="inline-block bg-[#FF6B00]/10 text-[#FF6B00] px-4 py-1 rounded-full text-sm font-semibold mb-6 border border-[#FF6B00]/20">
                        AFTER SCHOOL PROGRAM
                    </div>
                    <h1 className="headline-font text-5xl md:text-7xl text-white mb-6 text-glow">
                        AIA AFTER SCHOOL PROGRAM
                    </h1>
                    <p className="text-gray-300 text-xl leading-relaxed">
                        Details about this program are coming soon. Register your interest below and we'll be in touch with everything you need to know.
                    </p>
                    <div className="w-32 h-1 bg-[#FF6B00] mt-8"></div>
                </motion.div>

                {/* Form Block */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <AIAAfterSchoolProgramForm />
                </motion.div>
            </div>
        </div>
    );
}
