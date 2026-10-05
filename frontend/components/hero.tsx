"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  Bot
} from "lucide-react";
import { PriorityBadge } from "@/components/priority-badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Student Support & Triage</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              You don&apos;t have to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                figure it out alone.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Tell UniAssist what&apos;s going on in your own words. We&apos;ll help you understand your concern, cut through university bureaucracy, and connect you with the right support.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/chat"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:-translate-y-0.5 transition-all text-base"
              >
                <span>Talk to UniAssist</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <Link
                href="/support"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium px-6 py-3.5 rounded-xl border border-slate-700 hover:border-slate-600 transition-all text-base"
              >
                <span>Explore Campus Support</span>
              </Link>
            </div>

            {/* Trust and Privacy indicators */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Student-Controlled Privacy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Anonymous Option Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>24/7 Intelligent Routing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Interactive Mock Chatbot Preview */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-1 border border-slate-700/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60 bg-slate-900/60 rounded-t-xl">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">UniAssist AI</h4>
                    <p className="text-[10px] text-slate-400">Student Support Triage</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Live Demo
                  </span>
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-4 space-y-3.5 font-sans">
                {/* Student message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 text-xs sm:text-sm shadow-sm">
                    <p className="font-medium">
                      &quot;I&apos;m struggling to manage my classes and exams.&quot;
                    </p>
                    <span className="text-[10px] text-emerald-100/70 block text-right mt-1">10:14 AM</span>
                  </div>
                </div>

                {/* UniAssist response */}
                <div className="flex justify-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="max-w-[85%] space-y-2">
                    <div className="rounded-2xl rounded-tl-sm bg-slate-800 text-slate-200 p-3 text-xs sm:text-sm border border-slate-700/60 shadow-sm">
                      <p>
                        That sounds difficult. I can help you figure out what kind of support would be most useful.
                      </p>
                    </div>

                    {/* Triage Preview Card */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                          <span>Academic</span>
                        </div>
                        <PriorityBadge level={2} size="sm" customLabel="Support Recommended" />
                      </div>

                      <div className="text-[11px] text-slate-400 leading-snug">
                        Recommended: <span className="text-white font-medium">Academic Advising Center</span> (Workload & Exam planning)
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        <Link
                          href="/chat?preset=exam-pressure"
                          className="w-full text-center text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-1.5 rounded-lg transition"
                        >
                          Continue this flow →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Window Footer Input Mock */}
              <div className="p-3 border-t border-slate-700/60 bg-slate-900/60 rounded-b-xl flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tell UniAssist what's going on..."
                  readOnly
                  className="w-full bg-slate-800/80 text-xs text-slate-400 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
                  onClick={() => window.location.href = "/chat"}
                />
                <Link
                  href="/chat"
                  className="p-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
                >
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
