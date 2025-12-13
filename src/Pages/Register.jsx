import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, User, Mail, Phone, Users, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    age: "",
    division: "",
    team_name: "",
    tournament: "",
    experience_level: "",
    additional_info: ""
  });

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      // In a real app, you'd create a Registration entity and save the data
      // For now, we'll just simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      return data;
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const tournaments = [
    { id: "west-sydney-crown", name: "The West Sydney Crown - March 15-17, 2025" },
    { id: "street-legends", name: "Street Legends Cup - April 8-9, 2025" },
    { id: "kotp-championship", name: "KOTP Championship - May 20-22, 2025" }
  ];

  const divisions = [
    { id: "u16", name: "Under 16" },
    { id: "u18", name: "Under 18" },
    { id: "open", name: "Open (18+)" },
    { id: "womens", name: "Women's Division" }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full text-center"
        >
          <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C00] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="headline-font text-5xl md:text-6xl text-white mb-6">
            WELCOME TO THE KINGDOM!
          </h1>
          <p className="text-gray-400 text-xl mb-4">
            Your registration has been received successfully.
          </p>
          <p className="text-gray-500 mb-8">
            We'll send you a confirmation email at <span className="text-[#FF6B00]">{formData.email}</span> with all the details about your tournament.
          </p>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 mb-8">
            <h3 className="headline-font text-2xl text-white mb-4">WHAT'S NEXT?</h3>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="bg-[#FF6B00]/20 rounded-full p-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-white font-semibold">Check Your Email</p>
                  <p className="text-gray-400 text-sm">Confirmation and payment details sent within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#FF6B00]/20 rounded-full p-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-white font-semibold">Complete Payment</p>
                  <p className="text-gray-400 text-sm">Secure your spot by completing the registration fee</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#FF6B00]/20 rounded-full p-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-white font-semibold">Get Ready to Dominate</p>
                  <p className="text-gray-400 text-sm">Prepare to show your skills and rule the pitch</p>
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={() => window.location.href = '/'}
            className="kotp-button bg-[#FF6B00] text-white px-8 py-3 rounded-md headline-font text-lg tracking-wider hover:scale-105 transition-transform duration-300"
          >
            RETURN HOME
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C00] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="headline-font text-5xl md:text-7xl text-white mb-4 text-glow">
            CLAIM YOUR CROWN
          </h1>
          <p className="text-gray-400 text-xl">
            Register for an upcoming tournament and become a legend
          </p>
        </motion.div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center headline-font text-lg transition-all duration-300 ${
                    step >= num
                      ? "bg-[#FF6B00] text-white"
                      : "bg-[#1a1a1a] text-gray-500 border border-white/10"
                  }`}
                >
                  {num}
                </div>
                <p className={`text-sm mt-2 headline-font ${step >= num ? "text-[#FF6B00]" : "text-gray-500"}`}>
                  {num === 1 && "PERSONAL"}
                  {num === 2 && "TOURNAMENT"}
                  {num === 3 && "DETAILS"}
                </p>
              </div>
              {num < 3 && (
                <div className={`flex-1 h-1 mx-4 transition-colors duration-300 ${step > num ? "bg-[#FF6B00]" : "bg-white/10"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 md:p-12">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="headline-font text-3xl text-white mb-2">PERSONAL INFORMATION</h2>
                <p className="text-gray-400">Tell us about yourself</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-[#FF6B00]" />
                    FULL NAME *
                  </label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    required
                    className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#FF6B00]" />
                    EMAIL *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#FF6B00]" />
                    PHONE *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                    className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF6B00]" />
                    AGE *
                  </label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    required
                    className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12"
                    placeholder="Your age"
                    min="10"
                    max="99"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Tournament Selection */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="headline-font text-3xl text-white mb-2">SELECT TOURNAMENT</h2>
                <p className="text-gray-400">Choose your competition</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2">
                    <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_2q2yk2q2yk2q2yk2-Photoroom.svg" alt="Trophy" className="w-4 h-4" />
                    TOURNAMENT *
                  </label>
                  <Select value={formData.tournament} onValueChange={(value) => handleChange("tournament", value)} required>
                    <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12">
                      <SelectValue placeholder="Select a tournament" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {tournaments.map((tournament) => (
                        <SelectItem key={tournament.id} value={tournament.id} className="text-white hover:bg-white/5">
                          {tournament.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#FF6B00]" />
                    DIVISION *
                  </label>
                  <Select value={formData.division} onValueChange={(value) => handleChange("division", value)} required>
                    <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12">
                      <SelectValue placeholder="Select your division" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {divisions.map((division) => (
                        <SelectItem key={division.id} value={division.id} className="text-white hover:bg-white/5">
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-white mb-2 headline-font text-sm">
                    EXPERIENCE LEVEL *
                  </label>
                  <Select value={formData.experience_level} onValueChange={(value) => handleChange("experience_level", value)} required>
                    <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12">
                      <SelectValue placeholder="Your experience level" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      <SelectItem value="beginner" className="text-white hover:bg-white/5">Beginner</SelectItem>
                      <SelectItem value="intermediate" className="text-white hover:bg-white/5">Intermediate</SelectItem>
                      <SelectItem value="advanced" className="text-white hover:bg-white/5">Advanced</SelectItem>
                      <SelectItem value="professional" className="text-white hover:bg-white/5">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Additional Details */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="headline-font text-3xl text-white mb-2">FINAL DETAILS</h2>
                <p className="text-gray-400">Almost there, champion</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white mb-2 headline-font text-sm">
                    TEAM NAME (OPTIONAL)
                  </label>
                  <Input
                    value={formData.team_name}
                    onChange={(e) => handleChange("team_name", e.target.value)}
                    className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12"
                    placeholder="Enter your team name"
                  />
                  <p className="text-gray-500 text-sm mt-2">Leave blank if registering as an individual</p>
                </div>

                <div>
                  <label className="block text-white mb-2 headline-font text-sm">
                    ADDITIONAL INFORMATION
                  </label>
                  <Textarea
                    value={formData.additional_info}
                    onChange={(e) => handleChange("additional_info", e.target.value)}
                    className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] min-h-[120px]"
                    placeholder="Any special requirements, dietary restrictions, or other information we should know..."
                  />
                </div>

                <div className="bg-[#0a0a0a] border border-[#FF6B00]/30 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#FF6B00] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold mb-2">Registration Fee</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        A registration fee of $50 per player is required to secure your spot. 
                        Payment details will be sent to your email after submission.
                      </p>
                      <p className="text-gray-500 text-xs">
                        Full tournament terms and conditions apply.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-8 border-t border-white/10">
            {step > 1 && (
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 headline-font tracking-wider"
              >
                BACK
              </Button>
            )}
            
            <div className={step === 1 ? "ml-auto" : ""}>
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="kotp-button bg-[#FF6B00] text-white px-8 py-3 rounded-md headline-font tracking-wider hover:scale-105 transition-transform duration-300"
                >
                  NEXT STEP
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="kotp-button bg-[#FF6B00] text-white px-8 py-3 rounded-md headline-font tracking-wider hover:scale-105 transition-transform duration-300 disabled:opacity-50"
                >
                  {registerMutation.isPending ? "SUBMITTING..." : "COMPLETE REGISTRATION"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto mt-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
            <CheckCircle className="w-10 h-10 text-[#FF6B00] mx-auto mb-3" />
            <h3 className="headline-font text-lg text-white mb-2">SECURE REGISTRATION</h3>
            <p className="text-gray-400 text-sm">Your data is protected and secure</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
            <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_dpeqfhdpeqfhdpeq-Photoroom.svg" alt="Trophy" className="w-10 h-10 mx-auto mb-3" />
            <h3 className="headline-font text-lg text-white mb-2">OFFICIAL TOURNAMENT</h3>
            <p className="text-gray-400 text-sm">Sanctioned competitive events</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
            <Users className="w-10 h-10 text-[#FF6B00] mx-auto mb-3" />
            <h3 className="headline-font text-lg text-white mb-2">5000+ PLAYERS</h3>
            <p className="text-gray-400 text-sm">Join our growing community</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
