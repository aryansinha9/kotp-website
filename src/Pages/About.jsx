// PASTE THIS CODE INTO: src/Pages/About.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Award, Target, Users, Heart } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: <Award className="w-8 h-8 text-amber-500" />,
      title: 'Excellence',
      description: 'We strive for the highest standards in every tournament we organize, from venue quality to officiating.',
    },
    {
      icon: <Users className="w-8 h-8 text-amber-500" />,
      title: 'Development',
      description: 'Our focus is on player growth, providing a platform for young athletes to showcase talent and develop skills.',
    },
    {
      icon: <Heart className="w-8 h-8 text-amber-500" />,
      title: 'Passion',
      description: 'We are driven by a deep love for the game and a desire to create unforgettable football experiences.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">About Us</h1>
          <p className="mt-4 text-xl text-white/80">
            The driving force behind the most competitive youth football tournaments.
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
              <Target className="w-8 h-8 mr-4 text-amber-600" />
              Our Mission
            </h2>
            <div className="text-lg text-slate-600 space-y-4">
              <p>
                At King of the Pitch, our mission is to create a premier competitive platform for youth football. We are dedicated to fostering an environment of sportsmanship, skill development, and passion for the game.
              </p>
              <p>
                We believe in providing a professional and organized tournament experience that allows young athletes to challenge themselves, gain exposure, and create lasting memories. By bringing together top talent in world-class facilities, we aim to elevate the standard of youth football and inspire the next generation of champions.
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img
              src="https://images.unsplash.com/photo-1521484226848-6a9b13997f39?auto=format&fit=crop&q=80&w=1964"
              alt="Team celebrating"
              className="rounded-2xl shadow-xl w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
      
      {/* Our Values Section */}
      <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900">Our Core Values</h2>
                  <p className="text-lg text-slate-500 mt-2">The principles that guide us.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                  {values.map((value) => (
                      <div key={value.title} className="bg-white p-8 rounded-xl shadow-lg text-center">
                          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                              {value.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-slate-800 mb-3">{value.title}</h3>
                          <p className="text-slate-600">{value.description}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Compete?</h2>
          <p className="text-lg text-slate-600 mb-8">
            Browse our list of upcoming tournaments and find your next challenge.
          </p>
          <Link to="/tournaments">
            <Button size="lg" className="btn-accent font-semibold px-10 py-4 text-lg">
              View Tournaments
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}