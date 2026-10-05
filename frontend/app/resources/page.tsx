"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Search, 
  Download, 
  ExternalLink, 
  Clock, 
  Tag, 
  Sparkles, 
  Filter, 
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { MOCK_RESOURCES, Resource } from "@/data/mock-resources";

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Academic", "Wellbeing", "Financial", "Career", "Safety", "Campus Life"];

  const filteredResources = MOCK_RESOURCES.filter((res) => {
    const matchesCategory = selectedCategory === "All" || res.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Verified Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Student Resource Library & Guides
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1 max-w-2xl">
            Access official university forms, policy walk-throughs, study toolkits, and stress management guides.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides, forms, policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
              selectedCategory === cat
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Resource Spotlight if on All */}
      {selectedCategory === "All" && !searchQuery && (
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Spotlight Guide
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Exam Period Workload & Time Management Guide
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Curated study sprint methodology, cognitive stress release exercises, and formal deadline extension procedures.
            </p>
          </div>
          <Link
            href="/chat?category=academic"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition shrink-0 shadow-md shadow-emerald-500/20"
          >
            <span>Triage with UniAssist</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      )}

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 p-6 flex flex-col justify-between space-y-4 hover:shadow-xl transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  {res.category}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {res.readTime}
                </span>
              </div>

              <h3 className="text-base font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                {res.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                {res.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {res.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              {res.downloads && (
                <span className="text-[11px] text-slate-500">
                  {res.downloads.toLocaleString()} students accessed
                </span>
              )}

              <button
                type="button"
                onClick={() => alert(`Opening resource: ${res.title}. Available in PDF & Markdown formats.`)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition ml-auto"
              >
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
