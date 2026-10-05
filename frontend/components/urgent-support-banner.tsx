"use client";

import React from "react";
import { PhoneCall, ShieldAlert, MapPin, HeartHandshake, AlertCircle } from "lucide-react";
import Link from "next/link";

interface UrgentSupportBannerProps {
  onDismiss?: () => void;
}

export function UrgentSupportBanner({ onDismiss }: UrgentSupportBannerProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/70 border-2 border-red-500/50 p-6 shadow-2xl shadow-red-950/40 space-y-5 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 animate-pulse">
          <ShieldAlert className="w-6 h-6 text-red-400" />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Immediate Safety Priority</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Let&apos;s get you immediate support.
          </h2>
          <p className="text-sm text-slate-300">
            We noticed an urgent safety or wellbeing concern. You don&apos;t need to continue answering automated questions. We are prioritizing immediate human connection right now.
          </p>
        </div>
      </div>

      {/* Emergency Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {/* Campus Emergency Dispatch */}
        <a
          href="tel:911"
          className="flex flex-col justify-between p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-left transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Campus Police</span>
            <PhoneCall className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-base font-bold text-white">Call Emergency</div>
          <span className="text-xs text-red-200/80 font-mono mt-1">+1 (555) 911-SAFE</span>
        </a>

        {/* 24/7 Crisis Counselor */}
        <a
          href="tel:988"
          className="flex flex-col justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Wellbeing Helpline</span>
            <HeartHandshake className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-base font-bold text-white">24/7 Crisis Support</div>
          <span className="text-xs text-slate-400 font-mono mt-1">Dial 988 or text HOME</span>
        </a>

        {/* Campus Duty Officer */}
        <Link
          href="/support"
          className="flex flex-col justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">On-Campus</span>
            <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-base font-bold text-white">Find Nearby Help</div>
          <span className="text-xs text-slate-400 mt-1">Main Gate Security Hub</span>
        </Link>

        {/* Immediate Safe-Walk Escort */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-slate-800 border border-slate-700 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">SafeWalk Escort</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-white">Security Escort</div>
          <span className="text-xs text-slate-400 mt-1">Available 24/7 at all dorms</span>
        </div>
      </div>
    </div>
  );
}
