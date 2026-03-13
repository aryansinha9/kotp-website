import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, Send, CheckCircle, ShieldAlert } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Button } from "@/Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { supabase } from "@/supabaseClient";
import SizingGuideModal from "@/Components/ui/SizingGuideModal";

const apparelSizes = ["4Y", "6Y", "8Y", "10Y", "12Y", "14Y", "16Y"];

export default function ParkleaProgram() {
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
        team: "",
        jerseySize: "",
        shortsSize: "",
        socksSize: "",
        hasMedicalCondition: "no",
        medicalDescription: "",
        hasMedication: "no",
        medicationDetails: "",
        agreedToTerms: false,
        signature: "",
        signatureDate: "",
        packageType: "standard"
    });

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSizingModalOpen, setIsSizingModalOpen] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');

        try {
            // Supabase Edge Function handles the form data and creates a secure Stripe session URL
            // Assuming 'supabase' client is available in this scope
            const { data, error } = await supabase.functions.invoke('create-parklea-checkout', {
                body: formData,
            });

            if (error) throw error;
            if (data?.url) {
                // Redirect standard window location to the secure Stripe Checkout portal
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
                <Link to="/academy" className="inline-flex items-center text-gray-400 hover:text-[#FF6B00] mb-8 transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to Academy
                </Link>

                {/* Header Block */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
                    <div className="inline-block bg-[#FF6B00]/10 text-[#FF6B00] px-4 py-1 rounded-full text-sm font-semibold mb-6 border border-[#FF6B00]/20">
                        PARKLEA REGISTERED ATHLETES ONLY
                    </div>
                    <h1 className="headline-font text-5xl md:text-7xl text-white mb-6 text-glow">PARKLEA DEVELOPMENT PROGRAM</h1>
                    <p className="text-gray-300 text-xl leading-relaxed">
                        Elevate your game with our specialized elite development program. Designed exclusively for current Parklea FC athletes, this program focuses on advanced technical, tactical, and physical conditioning.
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
                                    <Input type="number" name="ageTurning2026" required value={formData.ageTurning2026} onChange={handleChange} min="4" max="25" className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Team *</Label>
                                    <Select required onValueChange={(val) => handleSelectChange("team", val)}>
                                        <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]">
                                            <SelectValue placeholder="Select team" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-60 overflow-y-auto">
                                            {["8A", "8B", "8C", "8D", "8E", "8F", "9A", "9B", "9C", "9D", "10A", "10B", "10C", "11A", "11B", "11C", "12A", "12B", "12C", "13A", "13B", "14A", "14B", "U15S", "16A", "16B", "10G", "12GA", "12GB", "14G"].map(team => <SelectItem key={team} value={team}>{team}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
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

                        {/* 3. Apparel */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between border-b border-[#FF6B00]/30 pb-2">
                                <h3 className="text-[#FF6B00] font-semibold text-sm uppercase tracking-wider">Apparel Sizing</h3>
                                <button type="button" onClick={() => setIsSizingModalOpen(true)} className="text-[#FF6B00] hover:text-white underline text-sm transition-colors cursor-pointer text-left">
                                    Sizing Guide
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">



                                <div className="space-y-2">
                                    <Label className="text-white">Jersey Size *</Label>
                                    <Select required onValueChange={(val) => handleSelectChange("jerseySize", val)}>
                                        <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]">
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                            {apparelSizes.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">Shorts Size *</Label>
                                    <Select required onValueChange={(val) => handleSelectChange("shortsSize", val)}>
                                        <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]">
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                            {apparelSizes.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">Socks Size *</Label>
                                    <Select required onValueChange={(val) => handleSelectChange("socksSize", val)}>
                                        <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]">
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                            <SelectItem value="One Size Fits All">One Size Fits All</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                            </div>
                        </section>

                        {/* 4. Medical Information */}
                        <section className="space-y-8 bg-[#0a0a0a] p-6 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <ShieldAlert className="w-5 h-5 text-[#FF6B00]" />
                                <h3 className="text-[#FF6B00] font-semibold text-sm uppercase tracking-wider margin-0">Medical Information & Safety</h3>
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

                        {/* 5. Package Selection */}
                        <section className="space-y-6 pt-6 border-t border-white/10">
                            <h3 className="text-[#FF6B00] font-semibold text-sm uppercase tracking-wider border-b border-[#FF6B00]/30 pb-2">Program Package</h3>
                            <div className="space-y-4">
                                <Label className="text-white text-base">Select your preferred registration package: *</Label>
                                <RadioGroup name="packageType" value={formData.packageType} onValueChange={(val) => handleSelectChange("packageType", val)} className="flex flex-col gap-3">
                                    <Label htmlFor="pkg-standard" className="flex items-center space-x-3 bg-white/5 p-4 rounded-lg border border-white/10 hover:border-[#FF6B00]/50 transition-colors cursor-pointer">
                                        <RadioGroupItem value="standard" id="pkg-standard" className="border-white/30 text-[#FF6B00]" />
                                        <div className="text-white font-medium flex-grow">
                                            Standard Program <span className="text-gray-400 font-normal ml-2">($15/week subscription)</span>
                                        </div>
                                    </Label>
                                    <Label htmlFor="pkg-trial" className="flex items-center space-x-3 bg-white/5 p-4 rounded-lg border border-white/10 hover:border-[#FF6B00]/50 transition-colors cursor-pointer">
                                        <RadioGroupItem value="trial" id="pkg-trial" className="border-white/30 text-[#FF6B00]" />
                                        <div className="text-white font-medium flex-grow">
                                            Single Trial Lesson <span className="text-gray-400 font-normal ml-2">($15 one-time payment)</span>
                                        </div>
                                    </Label>
                                </RadioGroup>
                            </div>
                        </section>

                        {/* 6. Consents & Signatures */}
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

                        <Button type="submit" disabled={submitting || !formData.agreedToTerms} className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white py-8 rounded-lg headline-font text-2xl tracking-wider pulse-glow disabled:opacity-50 mt-12 transition-all duration-300 h-auto disabled:cursor-not-allowed">
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
            <SizingGuideModal isOpen={isSizingModalOpen} onClose={() => setIsSizingModalOpen(false)} />
        </div>
    );
}
