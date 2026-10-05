"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Calendar, 
  Compass, 
  Search, 
  ExternalLink, 
  Navigation,
  ShieldAlert,
  Building,
  Check
} from "lucide-react";
import { SUPPORT_SERVICES, SUPPORT_CATEGORY_SLUGS, SupportService } from "@/data/support-services";

export default function SupportMapPage() {
  const [selectedService, setSelectedService] = useState<SupportService>(SUPPORT_SERVICES[0]);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredServices = SUPPORT_SERVICES.filter((svc) => {
    const matchesCat = filterCategory === "All" || svc.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesSearch = svc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          svc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          svc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Campus Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Campus Support Map & Hubs
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1">
            Locate physical support centers across university complexes, check operating hours, or book a direct visit.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search offices, buildings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Main Grid: Interactive Graphic Map on Left, Detail Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive Stylized Campus Map Layout */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interactive Campus Spatial View
            </span>
            <span className="text-[11px] text-slate-500">Click a pin to inspect office</span>
          </div>

          {/* Visual SVG Map Canvas */}
          <div className="relative w-full h-[380px] sm:h-[440px] rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center">
            {/* Campus Pathways (SVG grid) */}
            <svg className="absolute inset-0 w-full h-full stroke-slate-800/60" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Stylized campus roads */}
              <path d="M 50 200 Q 200 150 400 200 T 700 220" fill="none" stroke="#1e293b" strokeWidth="12" />
              <path d="M 250 50 Q 250 220 350 400" fill="none" stroke="#1e293b" strokeWidth="10" />
              <circle cx="280" cy="180" r="45" fill="#064e3b" fillOpacity="0.15" stroke="#059669" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="500" cy="280" r="55" fill="#1e1b4b" fillOpacity="0.2" stroke="#4338ca" strokeWidth="1" strokeDasharray="3 3" />
            </svg>

            {/* Campus Landmark Labels */}
            <span className="absolute top-4 left-6 text-[10px] font-bold tracking-wider uppercase text-slate-600">North Village Quad</span>
            <span className="absolute bottom-4 right-6 text-[10px] font-bold tracking-wider uppercase text-slate-600">Main Entrance & Security</span>
            <span className="absolute top-1/2 left-1/3 text-[10px] font-bold tracking-wider uppercase text-emerald-500/40">Central Academic Green</span>

            {/* Support Location Markers */}
            {SUPPORT_SERVICES.map((svc) => {
              const isSelected = selectedService.id === svc.id;
              return (
                <button
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  style={{
                    left: `${svc.coordinates.x}%`,
                    top: `${svc.coordinates.y}%`
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-all duration-300 z-10 ${
                    isSelected ? "scale-125 z-20" : "hover:scale-110"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                      isSelected
                        ? "bg-emerald-400 text-slate-950 ring-4 ring-emerald-500/30 font-bold"
                        : "bg-slate-800 text-emerald-400 border border-slate-700 group-hover:border-emerald-400"
                    }`}
                  >
                    <Building className="w-4 h-4" />
                  </div>
                  <span
                    className={`mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap border shadow-sm transition-all ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                        : "bg-slate-900/90 text-slate-300 border-slate-800 group-hover:text-white"
                    }`}
                  >
                    {svc.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Category Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {["All", "Academic", "Wellbeing", "Financial", "Safety", "Campus Life"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                  filterCategory === cat
                    ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Location Information Drawer (Right) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {selectedService.category} Support Hub
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                {selectedService.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1">{selectedService.tagline}</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {selectedService.description}
          </p>

          {/* Location Specifics */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block text-xs">Building & Room</span>
                <span className="font-semibold text-white">{selectedService.building} &bull; {selectedService.room}</span>
                <p className="text-xs text-slate-400 mt-0.5">{selectedService.location}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block text-xs">Hours of Operation</span>
                <span className="font-semibold text-white">{selectedService.hours}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-500 block text-[10px]">Phone</span>
                  <a href={`tel:${selectedService.phone}`} className="text-white hover:text-emerald-400 font-mono text-xs">
                    {selectedService.phone}
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-500 block text-[10px]">Email</span>
                  <a href={`mailto:${selectedService.email}`} className="text-white hover:text-emerald-400 text-xs">
                    {selectedService.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/chat?category=${encodeURIComponent(SUPPORT_CATEGORY_SLUGS[selectedService.category] ?? "")}`}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-md shadow-emerald-500/20"
            >
              <Calendar className="w-4 h-4 stroke-[2.5]" />
              <span>Start Triage to Book</span>
            </Link>

            <button
              type="button"
              onClick={() => alert(`Directions: Head towards ${selectedService.building}, take the main elevator to ${selectedService.room}. Interactive navigation enabled.`)}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-white font-semibold py-3 px-4 rounded-xl border border-slate-700 text-xs sm:text-sm transition"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Get Directions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
