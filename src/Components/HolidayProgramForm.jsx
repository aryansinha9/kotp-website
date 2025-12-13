import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign, Users, FileText } from "lucide-react";

const products = [
  {
    id: "trial",
    name: "KOTP Trial - Includes ONE Full Day",
    description: "Come try out the KOTP Holiday Program for ONE day. Love it? Feel free to come down to the other days on a pay as you go basis!",
    price: 60.00
  },
  {
    id: "one-week",
    name: "KOTP Development - ONE Full Week",
    description: "For only $50 a day you can enjoy a full week of Soccer fun here at the KOTP Holiday Program!",
    price: 250.00
  },
  {
    id: "two-weeks",
    name: "KOTP Ultimate - TWO Full Weeks",
    description: "The ULTIMATE package for fun. Yes we did THAT, 10 full days of hard work, learning and laughs.",
    price: 400.00
  },
  {
    id: "day-1",
    name: "KOTP holiday Program - Monday 29/9/2025",
    description: "8am - 3pm: Monday Day 1",
    price: 60.00
  },
  {
    id: "day-2",
    name: "KOTP holiday Program - Tuesday 30/9/2025",
    description: "8am - 3pm: Tuesday Day 2",
    price: 60.00
  },
  {
    id: "day-3",
    name: "KOTP holiday Program - Wednesday 1/10/2025",
    description: "8am - 3pm: Wednesday day 3",
    price: 60.00
  },
  {
    id: "day-4",
    name: "KOTP holiday Program - Thursday 2/10/2025",
    description: "8am - 3pm: Thursday day 4",
    price: 60.00
  },
  {
    id: "day-5",
    name: "KOTP holiday Program - Friday 3/10/2025",
    description: "8am - 3pm: Friday day 5",
    price: 60.00
  },
  {
    id: "day-6",
    name: "KOTP holiday Program - Monday 6/10/2025",
    description: "8am - 3pm: Monday day 6",
    price: 60.00
  },
  {
    id: "day-7",
    name: "KOTP holiday Program - Tuesday 7/10/2025",
    description: "8am - 3pm: Tuesday day 7",
    price: 60.00
  },
  {
    id: "day-8",
    name: "KOTP holiday Program - Wednesday 8/10/2025",
    description: "8am - 3pm: Wednesday day 8",
    price: 60.00
  },
  {
    id: "day-9",
    name: "KOTP holiday Program - Thursday 9/10/2025",
    description: "8am - 3pm: Thursday day 9",
    price: 60.00
  },
  {
    id: "day-10",
    name: "KOTP holiday Program - Friday 10/10/2025",
    description: "8am - 3pm: Friday Day 10",
    price: 60.00
  }
];

export default function HolidayProgramForm() {
  const [formData, setFormData] = useState({
    playerFirstName: "",
    playerLastName: "",
    playerBirthDate: "",
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
    selectedProducts: {},
    couponCode: "",
    referralFirstName: "",
    referralLastName: "",
    howDidYouHear: "",
    interestedPrograms: ""
  });

  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const calculateTotal = () => {
      let sum = 0;
      Object.entries(formData.selectedProducts).forEach(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        if (product && quantity > 0) {
          sum += product.price * quantity;
        }
      });
      setTotal(sum);
    };
    calculateTotal();
  }, [formData.selectedProducts]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleProductToggle = (productId, checked) => {
    setFormData({
      ...formData,
      selectedProducts: {
        ...formData.selectedProducts,
        [productId]: checked ? 1 : 0
      }
    });
  };

  const handleQuantityChange = (productId, quantity) => {
    setFormData({
      ...formData,
      selectedProducts: {
        ...formData.selectedProducts,
        [productId]: Math.max(0, parseInt(quantity) || 0)
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Placeholder for API integration
    console.log("Form Data:", formData);
    console.log("Total:", total);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert("Registration submitted successfully! (This is a placeholder - API integration pending)");
    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 md:p-12">
      <div className="text-center mb-12">
        <h2 className="headline-font text-4xl md:text-5xl text-white mb-4">
          KOTP HOLIDAY PROGRAM REGISTRATION
        </h2>
        <p className="text-gray-400 text-lg">
          Two weeks of fun, learning, and lots of soccer.
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
                className="bg-[#0a0a0a] border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Last Name *</Label>
              <Input
                required
                value={formData.playerLastName}
                onChange={(e) => handleInputChange("playerLastName", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white"
              />
            </div>
          </div>
          <div>
            <Label className="text-white mb-2 block">Player Birth Date *</Label>
            <Input
              type="date"
              required
              value={formData.playerBirthDate}
              onChange={(e) => handleInputChange("playerBirthDate", e.target.value)}
              className="bg-[#0a0a0a] border-white/10 text-white"
            />
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
                className="bg-[#0a0a0a] border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Last Name *</Label>
              <Input
                required
                value={formData.parentLastName}
                onChange={(e) => handleInputChange("parentLastName", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white"
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
                className="bg-[#0a0a0a] border-white/10 text-white"
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
                className="bg-[#0a0a0a] border-white/10 text-white"
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
              className="bg-[#0a0a0a] border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-white mb-2 block">Street Address Line 2</Label>
            <Input
              value={formData.streetAddress2}
              onChange={(e) => handleInputChange("streetAddress2", e.target.value)}
              className="bg-[#0a0a0a] border-white/10 text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-white mb-2 block">City *</Label>
              <Input
                required
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">State / Province *</Label>
              <Input
                required
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Postal / ZIP Code *</Label>
              <Input
                required
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white"
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
              className="bg-[#0a0a0a] border-white/10 text-white min-h-[100px]"
              placeholder="Please describe any allergies or medical conditions..."
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
              className="bg-[#0a0a0a] border-white/10 text-white min-h-[100px]"
              placeholder="Please provide details about inhaler usage..."
            />
          </div>
        </div>

        {/* Program Packages */}
        <div className="space-y-6">
          <h3 className="headline-font text-2xl text-[#FF6B00] flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            SELECT PROGRAM PACKAGES *
          </h3>
          <p className="text-gray-400 text-sm">
            Please note our sessions are held between 9am-3pm, Mon-Fri for the two-week holiday program.
          </p>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={!!formData.selectedProducts[product.id]}
                    onCheckedChange={(checked) => handleProductToggle(product.id, checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{product.name}</h4>
                    <p className="text-gray-400 text-sm mb-3">{product.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-[#FF6B00] font-bold text-lg">${product.price.toFixed(2)} AUD</span>
                      {formData.selectedProducts[product.id] > 0 && (
                        <div className="flex items-center gap-2">
                          <Label className="text-white text-sm">Quantity:</Label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.selectedProducts[product.id] || 1}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            className="bg-[#1a1a1a] border-white/10 text-white w-20"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Section */}
        <div className="space-y-6 bg-[#0a0a0a] border border-[#FF6B00]/30 rounded-lg p-6">
          <h3 className="headline-font text-2xl text-[#FF6B00] flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            PAYMENT
          </h3>
          <div className="flex gap-4">
            <Input
              value={formData.couponCode}
              onChange={(e) => handleInputChange("couponCode", e.target.value)}
              className="bg-[#1a1a1a] border-white/10 text-white"
              placeholder="Enter Coupon Code"
            />
            <Button type="button" variant="outline" className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10">
              Apply
            </Button>
          </div>
          <div className="border-t border-white/10 pt-4">
            <div className="flex justify-between items-center">
              <span className="headline-font text-2xl text-white">TOTAL:</span>
              <span className="headline-font text-3xl text-[#FF6B00]">${total.toFixed(2)} AUD</span>
            </div>
          </div>
        </div>

        {/* Terms & Signature */}
        <div className="space-y-6">
          <h3 className="headline-font text-2xl text-[#FF6B00] flex items-center gap-2">
            <FileText className="w-6 h-6" />
            TERMS & CONDITIONS
          </h3>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 space-y-4">
            <p className="text-gray-400 text-sm">
              By acknowledging and signing below, I am delivering an electronic signature that will have the same effect as an original manual paper signature. 
              The electronic signature will be equally as binding as an original manual paper signature.
            </p>
            <div className="flex items-start gap-3">
              <Checkbox
                required
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => handleInputChange("agreeTerms", checked)}
              />
              <Label className="text-white">I agree to the terms and conditions. *</Label>
            </div>
            <div>
              <Label className="text-white mb-2 block">Signature *</Label>
              <Input
                required
                value={formData.signature}
                onChange={(e) => handleInputChange("signature", e.target.value)}
                className="bg-[#1a1a1a] border-white/10 text-white"
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
                className="bg-[#1a1a1a] border-white/10 text-white"
              />
            </div>
          </div>
        </div>

        {/* Marketing & Referrals */}
        <div className="space-y-6">
          <h3 className="headline-font text-2xl text-[#FF6B00]">MARKETING & REFERRALS</h3>
          <div>
            <Label className="text-white mb-2 block">Who did you refer?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={formData.referralFirstName}
                onChange={(e) => handleInputChange("referralFirstName", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white"
                placeholder="First Name"
              />
              <Input
                value={formData.referralLastName}
                onChange={(e) => handleInputChange("referralLastName", e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white"
                placeholder="Last Name"
              />
            </div>
          </div>
          <div>
            <Label className="text-white mb-2 block">How did you find out about us?</Label>
            <Select value={formData.howDidYouHear} onValueChange={(value) => handleInputChange("howDidYouHear", value)}>
              <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="social-media">Social Media</SelectItem>
                <SelectItem value="previous-participant">Previous Participant</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white mb-2 block">Would you like to know more about other KOTP programs?</Label>
            <Select value={formData.interestedPrograms} onValueChange={(value) => handleInputChange("interestedPrograms", value)}>
              <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small-group">Small Group Sessions</SelectItem>
                <SelectItem value="private">Private Sessions</SelectItem>
                <SelectItem value="tournaments">KOTP Tournaments</SelectItem>
                <SelectItem value="birthdays">KOTP Birthdays</SelectItem>
                <SelectItem value="nothing">Nothing at the moment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-8">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.agreeTerms || total === 0}
            className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white py-6 headline-font text-xl tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT REGISTRATION"}
          </Button>
          <p className="text-gray-500 text-sm text-center mt-4">
            * This is a placeholder form. API integration pending.
          </p>
        </div>
      </form>
    </div>
  );
}
