import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, Send, CheckCircle, ShieldAlert, Calendar } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Button } from "@/Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { supabase } from "@/supabaseClient";

const holidayDays = [
    "Fri 3 Apr", "Sat 4 Apr", "Sun 5 Apr", 
    "Mon 6 Apr", "Tue 7 Apr", "Wed 8 Apr", "Thu 9 Apr", "Fri 10 Apr", 
    "Mon 13 Apr", "Tue 14 Apr", "Wed 15 Apr", "Thu 16 Apr", "Fri 17 Apr"
];

export default function HolidayProgram() {
    const [formData, setFormData] = useState({
        participantName: "",
        ageTurning2026: "",
        dob: "",
        position: "",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
        emergencyContact: "",
        homeAddress: "",
        hasMedicalCondition: "no",
        medicalDescription: "",
        hasMedication: "no",
        medicationDetails: "",
        agreedToTerms: false,
        signature: "",
        signatureDate: "",
        selectedDays: []
    });

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleDay = (day) => {
        setFormData(prev => {
            const days = prev.selectedDays.includes(day) 
                ? prev.selectedDays.filter(d => d !== day)
                : [...prev.selectedDays, day];
            return { ...prev, selectedDays: days };
        });
    };

    const dayCount = formData.selectedDays.length;
    let calculatedTotal = dayCount * 35;
    let packageDisplay = "Single Days";
    
    if (dayCount === 7) { 
        calculatedTotal = 199; 
        packageDisplay = "7-Day Package"; 
    } else if (dayCount >= 8 && dayCount <= 9) {
        calculatedTotal = 199 + ((dayCount - 7) * 35);
        packageDisplay = "7-Day + Extra Days";
    } else if (dayCount === 10) { 
        calculatedTotal = 299; 
        packageDisplay = "10-Day Full Program"; 
    } else if (dayCount >= 11 && dayCount <= 13) {
        calculatedTotal = 299 + ((dayCount - 10) * 35);
        packageDisplay = "10-Day + Extra Days";
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.selectedDays.length === 0) {
            setErrorMsg('Please select at least one day.');
            return;
        }

        setSubmitting(true);
        setErrorMsg('');

        try {
            const { data, error } = await supabase.functions.invoke('create-holiday-checkout', {
                body: { ...formData, totalAmount: calculatedTotal, packageType: packageDisplay },
            });

            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
            } else if (data?.error) {
                throw new Error(data.error);
            } else {
                throw new Error("Failed to generate checkout session.");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
            setSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center text-gray-400 hover:text-[#FF6B00] mb-8 transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to Home
                </Link>

                {/* Header Block */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
                    <div className="inline-block bg-[#FF6B00]/10 text-[#FF6B00] px-4 py-1 rounded-full text-sm font-semibold mb-6 border border-[#FF6B00]/20">
                        OPEN TO ALL ATHLETES
                    </div>
                    <h1 className="headline-font text-5xl md:text-7xl text-white mb-6 text-glow">HOLIDAY PROGRAM</h1>
                    <p className="text-gray-300 text-xl leading-relaxed">
                        Join our specialized holiday program. Designed for all athletes, this program focuses on advanced technical, tactical, and physical conditioning.
                    </p>
                    <div className="w-32 h-1 bg-[#FF6B00] mt-8"></div>
                </motion.div>

                {/* Form Block */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 md:p-10">
                    <div className="mb-10 pb-6 border-b border-white/10">
                        <h2 className="headline-font text-3xl text-white mb-2">REGISTRATION FORM</h2>
                        <p className="text-gray-400">Please complete all required fields accurately to secure your spot in the program.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* 1. Athlete Details */}
                        <section className="space-y-6">
                            <h3 className="text-[#FF6B00] font-semibold text-sm uppercase tracking-wider border-b border-[#FF6B00]/30 pb-2">Athlete Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-white">Participant Name *</Label>
                                    <Input name="participantName" required value={formData.participantName} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Date of Birth *</Label>
                                    <Input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] dark-calendar" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Age (Turning in 2026) *</Label>
                                    <Input type="number" name="ageTurning2026" required value={formData.ageTurning2026} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-white">Primary Position *</Label>
                                    <Input name="position" required value={formData.position} onChange={handleChange} placeholder="e.g. Striker, Midfielder, Defender" className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]" />
                                </div>
                            </div>
                        </section>

                        {/* 2. Parent / Guardian Details */}
                        <section className="space-y-6">
                            <h3 className="text-[#FF6B00] font-semibold text-sm uppercase tracking-wider border-b border-[#FF6B00]/30 pb-2">Parent / Guardian Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-white">Parent / Guardian Name *</Label>
                                    <Input name="parentName" required value={formData.parentName} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Parent Phone Number *</Label>
                                    <Input type="tel" name="parentPhone" required value={formData.parentPhone} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Parent Email *</Label>
                                    <Input type="email" name="parentEmail" required value={formData.parentEmail} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Emergency Contact (Name & Number) *</Label>
                                    <Input name="emergencyContact" required value={formData.emergencyContact} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-white">Home Address *</Label>
                                    <Textarea name="homeAddress" required value={formData.homeAddress} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] min-h-[80px]" />
                                </div>
                            </div>
                        </section>

                        {/* 3. Medical Information */}
                        <section className="space-y-8 bg-[#0a0a0a] p-6 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <ShieldAlert className="w-5 h-5 text-[#FF6B00]" />
                                <h3 className="text-[#FF6B00] font-semibold text-sm uppercase tracking-wider m-0">Medical Information & Safety</h3>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-white text-base">Does the participant have any medical conditions, allergies, or past injuries? *</Label>
                                <RadioGroup name="hasMedicalCondition" value={formData.hasMedicalCondition} onValueChange={(val) => handleSelectChange("hasMedicalCondition", val)} className="flex flex-col gap-3">
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="no" id="med-no" className="border-white/30 text-[#FF6B00]" />
                                        <Label htmlFor="med-no" className="text-gray-300 font-normal">No medical conditions</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="yes" id="med-yes" className="border-white/30 text-[#FF6B00]" />
                                        <Label htmlFor="med-yes" className="text-gray-300 font-normal">Yes, they have a medical condition</Label>
                                    </div>
                                </RadioGroup>

                                {formData.hasMedicalCondition === 'yes' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                                        <Label className="text-gray-400 text-sm mb-2 block">Please provide full details below: *</Label>
                                        <Textarea name="medicalDescription" required value={formData.medicalDescription} onChange={handleChange} className="bg-[#1a1a1a] border-white/20 text-white focus:border-[#FF6B00] min-h-[100px]" placeholder="Specify condition, triggers, severity..." />
                                    </motion.div>
                                )}
                            </div>

                            <div className="w-full h-px bg-white/5 my-4"></div>

                            <div className="space-y-4">
                                <Label className="text-white text-base">Will the participant require any prescribed medication to be administered during the program? *</Label>
                                <RadioGroup name="hasMedication" value={formData.hasMedication} onValueChange={(val) => handleSelectChange("hasMedication", val)} className="flex flex-col gap-3">
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="no" id="meds-no" className="border-white/30 text-[#FF6B00]" />
                                        <Label htmlFor="meds-no" className="text-gray-300 font-normal">No medication required</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="yes" id="meds-yes" className="border-white/30 text-[#FF6B00]" />
                                        <Label htmlFor="meds-yes" className="text-gray-300 font-normal">Yes, medication required</Label>
                                    </div>
                                </RadioGroup>

                                {formData.hasMedication === 'yes' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                                        <Label className="text-gray-400 text-sm mb-2 block">Please list medication and administration instructions: *</Label>
                                        <Textarea name="medicationDetails" required value={formData.medicationDetails} onChange={handleChange} className="bg-[#1a1a1a] border-white/20 text-white focus:border-[#FF6B00] min-h-[100px]" placeholder="Name of medication, dosage, timing, emergency procedures..." />
                                    </motion.div>
                                )}
                            </div>
                        </section>

                        {/* 4. Calendar Day Selection */}
                        <section className="space-y-6 pt-6 border-t border-white/10">
                            <div className="flex items-center gap-2 border-b border-[#FF6B00]/30 pb-2">
                                <Calendar className="w-5 h-5 text-[#FF6B00]" />
                                <h3 className="text-[#FF6B00] font-semibold text-sm uppercase tracking-wider m-0">Select Program Days</h3>
                            </div>
                            <p className="text-gray-400 text-sm">Choose the days you would like to attend. Note: 7 days is a $199 package, 10 days is a $299 package, and single days are $35/day.</p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {holidayDays.map((day) => {
                                    const isSelected = formData.selectedDays.includes(day);
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`p-3 rounded-lg border transition-all duration-200 text-sm font-medium ${
                                                isSelected 
                                                ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF6B00]' 
                                                : 'bg-[#1a1a1a] border-white/10 text-gray-300 hover:border-[#FF6B00]/50'
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>

                            {dayCount > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 bg-[#0a0a0a] p-6 rounded-lg border border-[#FF6B00]/30 flex flex-col sm:flex-row justify-between items-center">
                                    <div className="mb-4 sm:mb-0 text-center sm:text-left">
                                        <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Selected Package</p>
                                        <p className="text-xl text-white headline-font">{packageDisplay} ({dayCount} day{dayCount !== 1 ? 's' : ''})</p>
                                    </div>
                                    <div className="text-center sm:text-right">
                                        <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Due</p>
                                        <p className="text-3xl text-[#FF6B00] headline-font">${calculatedTotal}</p>
                                    </div>
                                </motion.div>
                            )}
                        </section>

                        {/* 5. Consents & Signatures */}
                        <section className="space-y-6 pt-6 border-t border-white/10">
                            <div className="flex items-start space-x-3 p-4 bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-lg group">
                                <input
                                    type="checkbox"
                                    id="agreedToTerms"
                                    name="agreedToTerms"
                                    required
                                    checked={formData.agreedToTerms}
                                    onChange={handleChange}
                                    className="mt-1 w-5 h-5 rounded border-gray-600 bg-[#0a0a0a] text-[#FF6B00] focus:ring-[#FF6B00] focus:ring-offset-0 transition-all cursor-pointer"
                                />
                                <Label htmlFor="agreedToTerms" className="text-gray-300 leading-relaxed cursor-pointer font-normal">
                                    I acknowledge that I have read and agree to both the <Link to="/terms-and-conditions" target="_blank" className="text-[#FF6B00] hover:underline font-semibold">Terms and Conditions</Link> and the <Link to="/privacy-policy" target="_blank" className="text-[#FF6B00] hover:underline font-semibold">Privacy Policy</Link>, including the liability waiver and medical consent. Let it be known that I am the authorized parent or legal guardian of the athlete. *
                                </Label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-white">Digital Signature (Type Full Name) *</Label>
                                    <Input name="signature" required value={formData.signature} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] font-serif italic text-lg tracking-wider px-4" placeholder="Type your full name" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Date *</Label>
                                    <Input type="date" name="signatureDate" required value={formData.signatureDate} onChange={handleChange} className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] dark-calendar" />
                                </div>
                            </div>
                        </section>

                        <Button type="submit" disabled={submitting || !formData.agreedToTerms || dayCount === 0} className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white py-8 rounded-lg headline-font text-2xl tracking-wider pulse-glow disabled:opacity-50 mt-12 transition-all duration-300 h-auto disabled:cursor-not-allowed">
                            {submitting ? "SECURING PAYMENT PORTAL..." : <><Send className="w-6 h-6 mr-3" /> PROCEED TO PAYMENT</>}
                        </Button>
                        {errorMsg && (
                            <p className="text-red-500 text-center mt-4 bg-red-500/10 py-3 px-4 rounded border border-red-500/20">{errorMsg}</p>
                        )}
                    </form>
                </motion.div>
            </div>
            <style>{`
        .dark-calendar::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
        }
      `}</style>
        </div>
    );
}
