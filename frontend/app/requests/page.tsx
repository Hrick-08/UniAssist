"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  MapPin, 
  ShieldCheck, 
  User, 
  Filter,
  Plus
} from "lucide-react";
import { MOCK_CASES, SupportCase } from "@/data/mock-cases";
import { PriorityBadge } from "@/components/priority-badge";

export default function RequestsPage() {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(MOCK_CASES[0]);

  const filteredCases = MOCK_CASES.filter((c) => {
    if (filterStatus === "All") return true;
    return c.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ServiceNow-Powered Student Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My Support Requests
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1">
            Track your open university cases, scheduled advisor meetings, and resolved tickets.
          </p>
        </div>

        <Link
          href="/chat"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-500/20 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Support Request</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {["All", "In Progress", "Awaiting Student", "Resolved"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl border transition ${
              filterStatus === status
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Two Column Layout: Case List on Left, Active Case Timeline Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Case Cards List (Left) */}
        <div className="lg:col-span-5 space-y-4">
          {filteredCases.map((c) => {
            const isSelected = selectedCase?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/20 ring-1 ring-emerald-500/30"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {c.trackingNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{c.category}</span>
                  </div>
                  <PriorityBadge level={c.priorityLevel} size="sm" customLabel={c.urgencyLabel} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{c.subcategory}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {c.problemSummary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Assigned: {c.assignedAdvisor}</span>
                  <span className={`font-semibold ${c.status === "Resolved" ? "text-emerald-400" : "text-amber-400"}`}>
                    ● {c.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Case Deep Detail Card (Right) */}
        {selectedCase && (
          <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {selectedCase.trackingNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Logged {selectedCase.createdDate}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-2">
                  {selectedCase.subcategory}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Assigned Team: <span className="text-white font-medium">{selectedCase.assignedTeam}</span>
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <PriorityBadge level={selectedCase.priorityLevel} size="md" customLabel={selectedCase.urgencyLabel} />
              </div>
            </div>

            {/* Student Note & Problem Description */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs sm:text-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Original Statement Submitted by Student
              </span>
              <p className="text-slate-200 italic leading-relaxed">
                &quot;{selectedCase.studentNote}&quot;
              </p>
            </div>

            {/* Live Progress Timeline */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Case Workflow Status
              </span>

              <div className="space-y-2">
                {selectedCase.timeline.map((step, idx) => {
                  const isDone = step.status === "completed";
                  const isCurr = step.status === "current";

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-start gap-3.5 transition ${
                        isCurr
                          ? "bg-slate-800/80 border-emerald-500/40"
                          : isDone
                          ? "bg-slate-950/60 border-slate-800"
                          : "bg-slate-950/20 border-slate-900 opacity-60"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                          isDone
                            ? "bg-emerald-500 text-slate-950"
                            : isCurr
                            ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/40 animate-pulse"
                            : "bg-slate-800 text-slate-600"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-bold ${isCurr ? "text-emerald-400" : isDone ? "text-white" : "text-slate-500"}`}>
                            {step.step}
                          </span>
                          <span className="text-[11px] text-slate-500">{step.date}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scheduled Appointment Notice if present */}
            {selectedCase.appointmentScheduled && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs sm:text-sm">
                <Calendar className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white block">Confirmed Appointment Scheduled</span>
                  <p className="text-emerald-300">
                    {selectedCase.appointmentScheduled.date} at {selectedCase.appointmentScheduled.time}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedCase.appointmentScheduled.location} &bull; With {selectedCase.appointmentScheduled.advisor}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
