"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  ArrowRight,
  Filter,
  Loader2
} from "lucide-react";
import { api, ApiError, CategoryDetail } from "@/lib/api";

interface FlatResource {
  title: string;
  url: string;
  category: CategoryDetail;
}

export default function ResourcesPage() {
  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.categories
      .list()
      .then(setCategories)
      .catch((err) => setError(err instanceof ApiError ? String(err.detail) : "Couldn't load resources."))
      .finally(() => setLoading(false));
  }, []);

  const resources: FlatResource[] = useMemo(
    () => categories.flatMap((cat) => cat.resources.map((r) => ({ ...r, category: cat }))),
    [categories]
  );

  const filteredResources = resources.filter((res) => {
    const matchesCategory = selectedCategory === "All" || res.category.slug === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      res.title.toLowerCase().includes(query) || res.category.name.toLowerCase().includes(query);
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
            Access official university forms, policy walk-throughs, and self-service guides by team.
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

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 text-slate-400 py-20">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading resources...</span>
        </div>
      ) : (
        <>
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 mr-1" />
            {["All", ...categories.map((c) => c.slug)].map((slug) => {
              const label = slug === "All" ? "All" : categories.find((c) => c.slug === slug)?.name ?? slug;
              return (
                <button
                  key={slug}
                  onClick={() => setSelectedCategory(slug)}
                  className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
                    selectedCategory === slug
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                      : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Featured: Triage CTA */}
          {selectedCategory === "All" && !searchQuery && (
            <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Not sure where to look?
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Let UniAssist triage your concern instead
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Describe what&apos;s going on and we&apos;ll route you to the right team and resources automatically.
                </p>
              </div>
              <Link
                href="/chat"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition shrink-0 shadow-md shadow-emerald-500/20"
              >
                <span>Triage with UniAssist</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          )}

          {/* Resource Cards Grid */}
          {filteredResources.length === 0 ? (
            <p className="text-slate-400 text-sm">No resources match your search.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res) => (
                <div
                  key={`${res.category.slug}-${res.url}`}
                  className="rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 p-6 flex flex-col justify-between space-y-4 hover:shadow-xl transition-all group"
                >
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {res.category.name}
                    </span>

                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                      {res.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {res.category.guidance}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
                    <Link
                      href={res.url}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
