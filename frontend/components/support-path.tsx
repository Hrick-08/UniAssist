import React from "react";
import { Check, CircleDot, ArrowDown } from "lucide-react";

export interface SupportPathStep {
  label: string;
  sublabel?: string;
  status: "completed" | "current" | "upcoming";
}

interface SupportPathProps {
  currentStepIndex: number;
  categoryName?: string;
  subcategoryName?: string;
  recommendedService?: string;
  actionName?: string;
}

export function SupportPath({
  currentStepIndex = 1,
  categoryName = "Academic Concern",
  subcategoryName = "Exam & Workload",
  recommendedService = "Academic Advisor",
  actionName = "Next Step / Action"
}: SupportPathProps) {
  const steps: SupportPathStep[] = [
    {
      label: "You",
      sublabel: "Problem shared",
      status: currentStepIndex > 0 ? "completed" : "current"
    },
    {
      label: categoryName,
      sublabel: "Category identified",
      status: currentStepIndex > 1 ? "completed" : currentStepIndex === 1 ? "current" : "upcoming"
    },
    {
      label: subcategoryName,
      sublabel: "Subcategory evaluated",
      status: currentStepIndex > 2 ? "completed" : currentStepIndex === 2 ? "current" : "upcoming"
    },
    {
      label: recommendedService,
      sublabel: "Recommended Support",
      status: currentStepIndex > 3 ? "completed" : currentStepIndex === 3 ? "current" : "upcoming"
    },
    {
      label: actionName,
      sublabel: "Appointment / Resolution",
      status: currentStepIndex >= 4 ? "current" : "upcoming"
    }
  ];

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Your Support Path</h3>
          <p className="text-[11px] text-slate-400">Live navigation progress</p>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Step {Math.min(currentStepIndex + 1, 5)} of 5
        </span>
      </div>

      <div className="space-y-1">
        {steps.map((step, idx) => {
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";

          return (
            <div key={idx} className="relative">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 -bottom-2 w-0.5 -ml-[1px] transition-colors ${
                    isCompleted ? "bg-emerald-500" : "bg-slate-800"
                  }`}
                />
              )}

              <div
                className={`flex items-start gap-3.5 p-2 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-slate-800/80 border border-emerald-500/30"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                {/* Status Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : isCurrent
                      ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/40 animate-pulse"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isCurrent ? (
                    <CircleDot className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-semibold">{idx + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isCurrent ? "text-emerald-400" : isCompleted ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  {step.sublabel && (
                    <p className="text-[11px] text-slate-400 truncate">{step.sublabel}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
