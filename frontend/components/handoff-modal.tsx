"use client";

import React, { useState } from "react";
import { X, UserCheck, Shield, Check, Lock, ArrowRight } from "lucide-react";
import { TriageResult } from "@/data/triage-flows";

interface HandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  triage: TriageResult;
  studentNotes?: string;
}

export function HandoffModal({
  isOpen,
  onClose,
  onConfirm,
  triage,
  studentNotes
}: HandoffModalProps) {
  const [allowContactInfo, setAllowContactInfo] = useState(true);
  const [allowAcademicHistory, setAllowAcademicHistory] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5 animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Before we connect you...
              </h3>
              <p className="text-xs text-slate-400">
                You control exactly what information is shared with advisors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* What is being shared */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div>
              <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500">Concern Area</span>
              <p className="text-sm font-semibold text-white">{triage.category} &bull; {triage.subcategory}</p>
            </div>

            <div>
              <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500">What you shared</span>
              <ul className="mt-1 space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Difficulty managing assignments and course deadlines</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Exam pressure affecting daily progress</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Trouble keeping up with multiple concurrent modules</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500">Connecting To</span>
              <p className="text-sm font-bold text-emerald-400">{triage.recommendedService}</p>
            </div>
          </div>

          {/* Privacy controls */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={allowContactInfo}
                onChange={(e) => setAllowContactInfo(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/20"
              />
              <span>Share student email for follow-up notifications</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={allowAcademicHistory}
                onChange={(e) => setAllowAcademicHistory(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/20"
              />
              <span>Allow advisor to view enrolled semester course codes</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted internal handoff</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-500/20"
            >
              <span>Review & Share</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
