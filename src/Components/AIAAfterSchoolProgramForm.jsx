import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Users, FileText, Send } from "lucide-react";
import { supabase } from "@/supabaseClient";

export default function AIAAfterSchoolProgramForm() {
  const [formData, setFormData] = useState({
    playerFirstName: "",
    playerLastName: "",
    playerBirthDate: "",
    yearGroup: "",
    parentFirstName: "",
    parentLastName: "",
    phoneNumber: "",
    parentEmail: "",
    streetAddress: "",
    streetAddress2: "",
    city: "",
    state: "",
    postalCode: "",
    allergies: "",
    inhaler: "",
    agreeTerms: false,
    signature: "",
    signatureDate: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.functions.invoke('create-aia-checkout', {
        body: { ...formData },
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 md:p-12">
      <div className="text-center mb-12">
        <h2 className="headline-font text-4xl md:text-5xl text-white mb-4">
          AIA AFTER SCHOOL PROGRAM REGISTRATION
        </h2>
        <p className="text-gray-400 text-lg">
          Register your athlete for the AIA After School Program.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Player Information */}
        <div className="space-y-6">
          <h3 className="headline-font text-2xl text-[#FF6B00] flex items-center gap-2">
            <Users className="w-6 h-6" />
            PLAYER INFORMATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white mb-2 block">First Name *</Label>
              <Input
                required
                value={formData.playerFirstName}
                onChange={(e) => handleInputChange("playerFirstName", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Last Name *</Label>
              <Input
                required
                value={formData.playerLastName}
                onChange={(e) => handleInputChange("playerLastName", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white mb-2 block">Player Birth Date *</Label>
              <Input
                type="date"
                required
                value={formData.playerBirthDate}
                onChange={(e) => handleInputChange("playerBirthDate", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] dark-calendar"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Year Group *</Label>
              <Select required value={formData.yearGroup} onValueChange={(value) => handleInputChange("yearGroup", value)}>
                <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white">
                  <SelectValue placeholder="Select Year Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kindergarten">Kindergarten</SelectItem>
                  <SelectItem value="year-1">Year 1</SelectItem>
                  <SelectItem value="year-2">Year 2</SelectItem>
                  <SelectItem value="year-3">Year 3</SelectItem>
                  <SelectItem value="year-4">Year 4</SelectItem>
                  <SelectItem value="year-5">Year 5</SelectItem>
                  <SelectItem value="year-6">Year 6</SelectItem>
                  <SelectItem value="year-7">Year 7</SelectItem>
                  <SelectItem value="year-8">Year 8</SelectItem>
                  <SelectItem value="year-9">Year 9</SelectItem>
                  <SelectItem value="year-10">Year 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Parent/Guardian Contact */}
        <div className="space-y-6">
          <h3 className="headline-font text-2xl text-[#FF6B00]">PARENT/GUARDIAN CONTACT</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white mb-2 block">First Name *</Label>
              <Input
                required
                value={formData.parentFirstName}
                onChange={(e) => handleInputChange("parentFirstName", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Last Name *</Label>
              <Input
                required
                value={formData.parentLastName}
                onChange={(e) => handleInputChange("parentLastName", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white mb-2 block">Phone Number *</Label>
              <Input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]"
                placeholder="e.g. 0400 000 000"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Parent Email *</Label>
              <Input
                type="email"
                required
                value={formData.parentEmail}
                onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]"
                placeholder="parent@email.com"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-6">
          <h3 className="headline-font text-2xl text-[#FF6B00]">ADDRESS INFORMATION</h3>
          <div>
            <Label className="text-white mb-2 block">Street Address *</Label>
            <Input
              required
              value={formData.streetAddress}
              onChange={(e) => handleInputChange("streetAddress", e.target.value)}
              className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <Label className="text-white mb-2 block">Street Address Line 2</Label>
            <Input
              value={formData.streetAddress2}
              onChange={(e) => handleInputChange("streetAddress2", e.target.value)}
              className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-white mb-2 block">City *</Label>
              <Input
                required
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">State / Province *</Label>
              <Input
                required
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Postal / ZIP Code *</Label>
              <Input
                required
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]"
              />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="space-y-6">
          <h3 className="headline-font text-2xl text-[#FF6B00]">MEDICAL INFORMATION</h3>
          <div>
            <Label className="text-white mb-2 block">
              Does the athlete have any allergies, chronic illness, or medical conditions? If yes, please describe. *
            </Label>
            <Textarea
              required
              value={formData.allergies}
              onChange={(e) => handleInputChange("allergies", e.target.value)}
              className="bg-[#0a0a0a] border-white/10 text-white min-h-[100px] focus:border-[#FF6B00]"
              placeholder="Please describe any allergies or medical conditions, or type 'None'."
            />
          </div>
          <div>
            <Label className="text-white mb-2 block">
              Is the athlete prescribed an inhaler? If yes, please explain any instructions. *
            </Label>
            <Textarea
              required
              value={formData.inhaler}
              onChange={(e) => handleInputChange("inhaler", e.target.value)}
              className="bg-[#0a0a0a] border-white/10 text-white min-h-[100px] focus:border-[#FF6B00]"
              placeholder="Please provide details about inhaler usage, or type 'No'."
            />
          </div>
        </div>

        {/* Terms & Signature */}
        <div className="space-y-6">
          <h3 className="headline-font text-2xl text-[#FF6B00] flex items-center gap-2">
            <FileText className="w-6 h-6" />
            TERMS &amp; CONDITIONS
          </h3>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 space-y-4">
            <p className="text-gray-400 text-sm">
              By acknowledging and signing below, I am delivering an electronic signature that will have the same
              effect as an original manual paper signature.
            </p>
            <div className="flex items-start gap-3 p-4 bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-lg">
              <Checkbox
                required
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => handleInputChange("agreeTerms", checked)}
                className="mt-1"
              />
              <Label className="text-white leading-relaxed font-normal">
                I acknowledge that I have read and agree to both the{' '}
                <Link to="/terms-and-conditions" target="_blank" className="text-[#FF6B00] hover:underline font-semibold">Terms and Conditions</Link>{' '}
                and the{' '}
                <Link to="/privacy-policy" target="_blank" className="text-[#FF6B00] hover:underline font-semibold">Privacy Policy</Link>,
                including the liability waiver and medical consent. I confirm I am the authorised parent or legal guardian of the athlete. *
              </Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white mb-2 block">Digital Signature (Type Full Name) *</Label>
                <Input
                  required
                  value={formData.signature}
                  onChange={(e) => handleInputChange("signature", e.target.value)}
                  className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00] font-serif italic text-lg tracking-wider px-4"
                  placeholder="Type your full name"
                />
                <p className="text-gray-500 text-xs mt-1">Type your full name as your electronic signature</p>
              </div>
              <div>
                <Label className="text-white mb-2 block">Signature Date *</Label>
                <Input
                  type="date"
                  required
                  value={formData.signatureDate}
                  onChange={(e) => handleInputChange("signatureDate", e.target.value)}
                  className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00] dark-calendar"
                />
              </div>
            </div>
          </div>
        </div>


        {/* Submit */}
        <div className="pt-8">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.agreeTerms}
            className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white py-8 rounded-lg headline-font text-2xl tracking-wider pulse-glow disabled:opacity-50 mt-4 transition-all duration-300 h-auto disabled:cursor-not-allowed"
          >
            {isSubmitting ? "SECURING PAYMENT PORTAL..." : <><Send className="w-6 h-6 mr-3" /> PROCEED TO PAYMENT</>}
          </Button>
          {errorMsg && (
            <p className="text-red-500 text-center mt-4 bg-red-500/10 py-3 px-4 rounded border border-red-500/20">
              {errorMsg}
            </p>
          )}
        </div>
      </form>

      <style>{`
        .dark-calendar::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
