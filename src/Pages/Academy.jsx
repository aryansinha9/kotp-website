// src/Pages/Academy.jsx (New Page - COMPLETE AND UNABBREVIATED)

import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { supabase } from "@/supabaseClient";
import {
    Trophy, Target, Users, Award, ChevronRight, Check,
    Mail, Phone, MapPin, Calendar, Clock, Star, Play, AlertCircle
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/Components/ui/accordion";

// Placeholder for missing HolidayProgramForm component
const HolidayProgramForm = () => (
    <div className="text-center bg-[#1a1a1a] border border-white/10 rounded-lg p-8">
        <h2 className="headline-font text-4xl text-white mb-4">Holiday Program Registration</h2>
        <p className="text-gray-400">This feature is coming soon. Please check back later!</p>
    </div>
);

import { CardContainer, CardBody, CardItem } from "@/Components/ui/3d-card";


const FeatureCard = ({ icon: Icon, title, description, delay }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay }}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 hover:border-[#FF6B00]/50 transition-all duration-300"
        >
            <Icon className="w-12 h-12 text-[#FF6B00] mb-4" />
            <h3 className="headline-font text-xl text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
        </motion.div>
    );
};

const ProgramCard = ({ title, ageGroup, schedule, focus, price, delay }) => {
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
            <div className="flex items-start justify-between mb-4">
                <h3 className="headline-font text-2xl text-white">{title}</h3>
                <Trophy className="w-8 h-8 text-[#FF6B00] group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-300"><Users className="w-4 h-4 text-[#FF6B00]" /><span className="text-sm">{ageGroup}</span></div>
                <div className="flex items-center gap-2 text-gray-300"><Calendar className="w-4 h-4 text-[#FF6B00]" /><span className="text-sm">{schedule}</span></div>
                <div className="flex items-center gap-2 text-gray-300"><Target className="w-4 h-4 text-[#FF6B00]" /><span className="text-sm">{focus}</span></div>
            </div>
            <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                    <span className="headline-font text-xl text-white">{price}</span>
                    <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">Learn More</Button>
                </div>
            </div>
        </motion.div>
    );
};

const CoachCard = ({ name, role, qualifications, experience, quote, delay }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay }}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 hover:border-[#FF6B00]/50 transition-all duration-300"
        >
            <div className="w-24 h-24 bg-[#2a2a2a] rounded-full flex items-center justify-center mb-4 mx-auto"><Users className="w-12 h-12 text-[#FF6B00]" /></div>
            <h3 className="headline-font text-xl text-white text-center mb-1">{name}</h3>
            <p className="text-[#FF6B00] text-sm text-center mb-3">{role}</p>
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm"><Award className="w-4 h-4 text-[#FF6B00]" /><span>{qualifications}</span></div>
                <div className="flex items-center gap-2 text-gray-400 text-sm"><Clock className="w-4 h-4 text-[#FF6B00]" /><span>{experience}</span></div>
            </div>
            <p className="text-gray-400 text-sm italic text-center">"{quote}"</p>
        </motion.div>
    );
};

export default function Academy() {
    const [quizData, setQuizData] = useState({ playerName: "", age: "", skillLevel: "", goals: "", parentName: "", parentEmail: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showQuizResults, setShowQuizResults] = useState(false);

    const handleQuizSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        const messageBody = `New Academy Program Recommendation Request:\nPlayer Name: ${quizData.playerName}\nAge Group: ${quizData.age}\nSkill Level: ${quizData.skillLevel}\nGoals: ${quizData.goals}\nParent Name: ${quizData.parentName}\nParent Email: ${quizData.parentEmail}`;
        const payload = { name: quizData.parentName, email: quizData.parentEmail, message: messageBody, subject: "Academy Program Inquiry" };

        const { error: invokeError } = await supabase.functions.invoke('contact-form-handler', { body: JSON.stringify(payload) });

        if (invokeError) {
            setError('Could not submit your request. Please try again later.');
        } else {
            setShowQuizResults(true);
        }
        setSubmitting(false);
    };

    const features = [
        { icon: Trophy, title: "Elite Coaching", description: "Learn from certified coaches with professional experience" },
        { icon: Target, title: "Player Pathways", description: "Clear progression routes to representative and elite levels" },
        { icon: Award, title: "Data-Driven Training", description: "Video analysis and performance tracking for every player" },
        { icon: Users, title: "Inclusive Programs", description: "Programs for all ages, genders, and skill levels" }
    ];

    const programs = [
        { title: "Mini Kickers", ageGroup: "Ages 4-7", schedule: "Saturdays 9am-10am", focus: "Fun, fundamentals, coordination", price: "$120/term" },
        { title: "Development Squad", ageGroup: "Ages 8-12", schedule: "Mon & Wed 4pm-5:30pm", focus: "Technical skills, teamwork", price: "$280/term" },
        { title: "High-Performance Academy", ageGroup: "Ages 13-16", schedule: "Tue & Thu 5pm-7pm", focus: "Advanced tactics, conditioning", price: "$350/term" },
        { title: "Elite Pathway", ageGroup: "Ages 16+", schedule: "Custom schedule", focus: "Rep preparation, college pathway", price: "Contact us" }
    ];

    const coaches = [
        { name: "DAVID MARTINEZ", role: "Head Coach", qualifications: "FFA B-License, Sports Science Degree", experience: "12 years coaching", quote: "Every player has the potential to be great with the right guidance." },
        { name: "SARAH CHEN", role: "Technical Director", qualifications: "AFC A-License, Former Pro Player", experience: "8 years elite coaching", quote: "We focus on developing the complete player, not just skills." },
        { name: "JAMES WILSON", role: "Goalkeeper Coach", qualifications: "GK Specialist Certification", experience: "10 years GK coaching", quote: "Goalkeepers are game-changers. We train them to be leaders." }
    ];

    const faqs = [
        { question: "What should players bring to training?", answer: "Players should bring: boots, shin pads, water bottle, and appropriate training gear. We provide balls and training equipment." },
        { question: "Can beginners join the academy?", answer: "Absolutely! We have programs designed specifically for beginners. Our coaches will assess and place your child in the appropriate group." },
        { question: "What is your refund policy?", answer: "We offer a full refund within the first two weeks of the term. After that, refunds are considered on a case-by-case basis for medical or family emergencies." },
        { question: "Do all coaches have Working With Children Checks?", answer: "Yes, all our coaches have current Working With Children Checks and First Aid certifications. Child safety is our top priority." },
        { question: "Are parents allowed to watch training?", answer: "Parents are welcome to watch from designated viewing areas. We encourage positive support while allowing coaches to work with the players." },
        { question: "How does player grading work?", answer: "Players are assessed based on age, skill level, and experience. We conduct evaluations at the start of each term to ensure proper placement." }
    ];

    return (
        <div className="relative min-h-screen bg-[#0a0a0a]">
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=2000" alt="Academy Training" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/70"></div>
                </div>
                <div className="relative z-10 text-center px-4 max-w-4xl">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <CardContainer className="inter-var mb-6">
                            <CardBody className="relative group/card w-auto h-auto">
                                <CardItem translateZ="100" className="w-full">
                                    <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_3g32263g32263g32-Photoroom.svg" alt="Academy" className="w-48 h-48 mx-auto" />
                                </CardItem>
                            </CardBody>
                        </CardContainer>
                        <h1 className="headline-font text-6xl md:text-8xl text-white mb-6 text-glow">KOTP ACADEMY</h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8">Developing the next generation of football talent</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white px-8 py-6 headline-font text-lg" onClick={() => document.getElementById('onboarding-quiz').scrollIntoView({ behavior: 'smooth' })}>START YOUR JOURNEY</Button>
                            <Button variant="outline" className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 px-8 py-6 headline-font text-lg" onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}>VIEW PROGRAMS</Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-24 px-4 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
                        <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">WHY CHOOSE KOTP ACADEMY?</h2>
                        <div className="w-32 h-1 bg-[#FF6B00] mx-auto mb-8"></div>
                        <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-12">Founded to nurture talent from Western Sydney, our academy combines professional coaching, data-driven training methods, and a proven pathway to representative football. We develop not just skilled players, but confident, disciplined athletes ready for the next level.</p>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (<FeatureCard key={index} {...feature} delay={index * 0.1} />))}
                    </div>
                </div>
            </section>

            <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
                        <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">OUR METHODOLOGY</h2>
                        <div className="w-32 h-1 bg-[#FF6B00] mx-auto"></div>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}><img src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2000" alt="Training" className="rounded-lg w-full h-[400px] object-cover" /></motion.div>
                        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-6">
                            {["Video analysis and performance tracking", "Individual player development plans", "Sports psychology and mental skills training", "Strength, conditioning, and injury prevention", "Tactical education and game intelligence", "Pathway connections to NPL clubs"].map((item, index) => (<div key={index} className="flex items-start gap-3"><Check className="w-6 h-6 text-[#FF6B00] flex-shrink-0 mt-1" /><p className="text-gray-300 text-lg">{item}</p></div>))}
                        </motion.div>
                    </div>
                </div>
            </section>

            <section id="programs" className="py-24 px-4 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
                        <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">OUR PROGRAMS</h2>
                        <div className="w-32 h-1 bg-[#FF6B00] mx-auto mb-6"></div>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Programs designed for every age and skill level</p>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {programs.map((program, index) => (<ProgramCard key={index} {...program} delay={index * 0.1} />))}
                    </div>
                </div>
            </section>

            <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
                        <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">MEET THE COACHES</h2>
                        <div className="w-32 h-1 bg-[#FF6B00] mx-auto"></div>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {coaches.map((coach, index) => (<CoachCard key={index} {...coach} delay={index * 0.1} />))}
                    </div>
                </div>
            </section>

            <section id="holiday-program" className="py-24 px-4 bg-[#0a0a0a]">
                <div className="max-w-5xl mx-auto"><HolidayProgramForm /></div>
            </section>

            <section id="onboarding-quiz" className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-12">
                        <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">FIND YOUR PROGRAM</h2>
                        <div className="w-32 h-1 bg-[#FF6B00] mx-auto mb-6"></div>
                        <p className="text-gray-400 text-lg">Answer a few questions and we'll recommend the perfect program</p>
                    </motion.div>
                    {!showQuizResults ? (
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8">
                            <form onSubmit={handleQuizSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><Label className="text-white mb-2 block">Player Name *</Label><Input required value={quizData.playerName} onChange={(e) => setQuizData({ ...quizData, playerName: e.target.value })} className="bg-[#0a0a0a] border-white/10 text-white" placeholder="Full name" /></div>
                                    <div><Label className="text-white mb-2 block">Age *</Label><Select value={quizData.age} onValueChange={(value) => setQuizData({ ...quizData, age: value })}><SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white"><SelectValue placeholder="Select age" /></SelectTrigger><SelectContent><SelectItem value="4-7">4-7</SelectItem><SelectItem value="8-12">8-12</SelectItem><SelectItem value="13-16">13-16</SelectItem><SelectItem value="16+">16+</SelectItem></SelectContent></Select></div>
                                </div>
                                <div>
                                    <Label className="text-white mb-2 block">Skill Level *</Label>
                                    <RadioGroup value={quizData.skillLevel} onValueChange={(value) => setQuizData({ ...quizData, skillLevel: value })} className="flex space-x-4"><div className="flex items-center space-x-2"><RadioGroupItem value="beginner" id="beginner" /><Label htmlFor="beginner" className="text-gray-300">Beginner</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="intermediate" id="intermediate" /><Label htmlFor="intermediate" className="text-gray-300">Intermediate</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="advanced" id="advanced" /><Label htmlFor="advanced" className="text-gray-300">Advanced</Label></div></RadioGroup>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><Label className="text-white mb-2 block">Parent/Guardian Name *</Label><Input required value={quizData.parentName} onChange={(e) => setQuizData({ ...quizData, parentName: e.target.value })} className="bg-[#0a0a0a] border-white/10 text-white" placeholder="Full name" /></div>
                                    <div><Label className="text-white mb-2 block">Email *</Label><Input required type="email" value={quizData.parentEmail} onChange={(e) => setQuizData({ ...quizData, parentEmail: e.target.value })} className="bg-[#0a0a0a] border-white/10 text-white" placeholder="your@email.com" /></div>
                                </div>
                                <Button type="submit" disabled={submitting} className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white py-6 headline-font text-lg">{submitting ? 'SUBMITTING...' : 'GET RECOMMENDATION'}<ChevronRight className="w-5 h-5 ml-2" /></Button>
                                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                            </form>
                        </div>
                    ) : (
                        <div className="bg-[#1a1a1a] border border-[#FF6B00] rounded-lg p-8">
                            <h3 className="headline-font text-3xl text-white mb-6 text-center">YOUR RECOMMENDATION</h3>
                            <div className="bg-[#0a0a0a] rounded-lg p-6 mb-6">
                                <h4 className="headline-font text-2xl text-[#FF6B00] mb-4">Thank You!</h4>
                                <p className="text-gray-300">Our team has received your details. We will email you at <span className="font-semibold text-white">{quizData.parentEmail}</span> with our official program recommendation shortly.</p>
                            </div>
                            <Button variant="outline" className="w-full border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 py-6 headline-font" onClick={() => setShowQuizResults(false)}>START OVER</Button>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-24 px-4 bg-[#0a0a0a]">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-12">
                        <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">FAQs</h2>
                        <div className="w-32 h-1 bg-[#FF6B00] mx-auto"></div>
                    </motion.div>
                    <Accordion type="single" collapsible className="space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="bg-[#1a1a1a] border border-white/10 rounded-lg px-6">
                                <AccordionTrigger className="text-white hover:text-[#FF6B00] headline-font text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-gray-400">{faq.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-[#1a1a1a] border border-[#FF6B00] rounded-lg p-12 text-center">
                        <Trophy className="w-16 h-16 text-[#FF6B00] mx-auto mb-6" />
                        <h2 className="headline-font text-4xl md:text-5xl text-white mb-6">ACADEMY TO ARENA</h2>
                        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">Academy players get priority access to our competitive tournaments, providing real-game experience.</p>
                        <Link to="/tournaments"><Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white px-8 py-6 headline-font text-lg">VIEW TOURNAMENTS<ChevronRight className="w-5 h-5 ml-2" /></Button></Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
