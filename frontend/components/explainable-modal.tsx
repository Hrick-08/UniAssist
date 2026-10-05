"use client";

import React from "react";
import { X, Sparkles, Check, HelpCircle, ShieldCheck } from "lucide-react";
import { TriageResult } from "@/data/triage-flows";

interface ExplainableModalProps {
  isOpen: boolean;
  onClose: () => void;
  triage: TriageResult;
}

export function ExplainableModal({ isOpen, onClose, triage }: ExplainableModalProps) {
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Explainable Routing
              </h3>
              <p className="text-xs text-slate-400">
                Transparent AI reasoning breakdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            We recommended <span className="font-semibold text-emerald-400">{triage.recommendedService}</span> because:
          </p>

          {/* Reasoning Checklist */}
          <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {triage.reasoning.map((reason, index) => (
              <div key={index} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>{reason}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              This is a triage recommendation, not a diagnosis. You can adjust this recommendation or request a different support office at any time.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-md shadow-emerald-500/20"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
