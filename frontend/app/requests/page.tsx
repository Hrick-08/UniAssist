"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  ShieldCheck,
  Plus,
  Loader2,
  Check
} from "lucide-react";
import { api, ApiError, CaseOut, CaseStatus, CaseSummary } from "@/lib/api";
import { ensureAuth } from "@/lib/auth";
import { PriorityBadge } from "@/components/priority-badge";

const STATUS_TABS: { label: string; value: CaseStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Received", value: "received" },
  { label: "Assigned", value: "assigned" },
  { label: "Appointment Scheduled", value: "appointment_scheduled" },
  { label: "Resolved", value: "resolved" }
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function RequestsPage() {
  const [filterStatus, setFilterStatus] = useState<CaseStatus | "All">("All");
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [detail, setDetail] = useState<CaseOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await ensureAuth();
        const list = await api.cases.list();
        setCases(list);
        if (list.length > 0) setSelectedReference(list[0].reference);
      } catch (err) {
        setError(err instanceof ApiError ? String(err.detail) : "Couldn't load your requests.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedReference) {
        setDetail(null);
        return;
      }
      setDetailLoading(true);
      try {
        setDetail(await api.cases.get(selectedReference));
      } catch {
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    })();
  }, [selectedReference]);

  const filteredCases = cases.filter((c) => filterStatus === "All" || c.status === filterStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Live University Case Tracking</span>
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

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl border transition ${
              filterStatus === tab.value
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 text-slate-400 py-20">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your requests...</span>
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-slate-400">You don&apos;t have any support requests yet.</p>
          <Link href="/chat" className="text-emerald-400 font-semibold hover:text-emerald-300">
            Start a conversation with UniAssist →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Case Cards List (Left) */}
          <div className="lg:col-span-5 space-y-4">
            {filteredCases.map((c) => {
              const isSelected = selectedReference === c.reference;
              return (
                <div
                  key={c.reference}
                  onClick={() => setSelectedReference(c.reference)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/20 ring-1 ring-emerald-500/30"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {c.reference}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{c.category.name}</span>
                    </div>
                    <PriorityBadge level={c.priority} size="sm" customLabel={c.priority_label} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{c.assigned_team}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {c.category.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Logged {formatDate(c.created_at)}</span>
                    <span className={`font-semibold ${c.status === "resolved" ? "text-emerald-400" : "text-amber-400"}`}>
                      ● {c.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Case Deep Detail Card (Right) */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            {detailLoading ? (
              <div className="flex items-center justify-center gap-3 text-slate-400 py-16">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading case details...</span>
              </div>
            ) : detail ? (
              <>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {detail.reference}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Logged {formatDate(detail.created_at)}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-2">
                      {detail.category.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Assigned Team: <span className="text-white font-medium">{detail.assigned_team}</span>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <PriorityBadge level={detail.priority} size="md" customLabel={detail.priority_label} />
                  </div>
                </div>

                {/* Student Note & Problem Description */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs sm:text-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Original Statement Submitted by Student
                  </span>
                  <p className="text-slate-200 italic leading-relaxed">
                    &quot;{detail.description}&quot;
                  </p>
                </div>

                {/* Live Progress Timeline */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Case Workflow Status
                  </span>

                  <div className="space-y-2">
                    {detail.timeline.map((step, idx) => {
                      const isDone = step.state === "done";
                      const isCurr = step.state === "current";

                      return (
                        <div
                          key={step.key}
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
                            {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className={`font-bold text-xs ${isCurr ? "text-emerald-400" : isDone ? "text-white" : "text-slate-500"}`}>
                              {step.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Updates from staff */}
                {detail.events.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Updates
                    </span>
                    <div className="space-y-2 text-xs">
                      {detail.events.map((event, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                          <span className="text-slate-300">{event.message}</span>
                          <span className="text-slate-500 shrink-0">{formatDate(event.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scheduled Appointment Notice if present */}
                {detail.appointments.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs sm:text-sm">
                    <Calendar className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-white block">Confirmed Appointment Scheduled</span>
                      <p className="text-emerald-300">{formatDate(detail.appointments[0].starts_at)}</p>
                      <p className="text-xs text-slate-400">With {detail.appointments[0].team_name}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-400 text-sm">Select a request to see its details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
