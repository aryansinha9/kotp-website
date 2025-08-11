import React from "react";
import { Trophy, Users, Calendar, Star } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      icon: Trophy,
      value: "150+",
      label: "Tournaments Hosted",
      color: "text-emerald-600"
    },
    {
      icon: Users,
      value: "5,000+",
      label: "Players Registered",
      color: "text-blue-600"
    },
    {
      icon: Calendar,
      value: "8",
      label: "Years Experience",
      color: "text-purple-600"
    },
    {
      icon: Star,
      value: "4.9",
      label: "Average Rating",
      color: "text-amber-600"
    }
  ];

  return (
    <section className="py-20 hero-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tournament Excellence
          </h2>
          <p className="text-xl text-emerald-100">
            Trusted by thousands of teams across the region
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </div>
              <div className="text-emerald-200 text-lg">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}