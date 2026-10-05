"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  Calendar,
  UserCheck,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Clock,
  ShieldCheck,
  PhoneCall,
  Loader2
} from "lucide-react";
import { PriorityBadge } from "@/components/priority-badge";
import { ExplainableModal } from "@/components/explainable-modal";
import { HandoffModal } from "@/components/handoff-modal";
import { mapTriageResponse, TriageResult } from "@/data/triage-flows";
import { api, ApiError, CategoryDetail, EscalationContact } from "@/lib/api";
import { ensureAuth } from "@/lib/auth";

function RecommendationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const triageId = searchParams.get("id");

  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [escalationContacts, setEscalationContacts] = useState<EscalationContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      if (!triageId) {
        setError("No triage result to show. Start a new conversation with UniAssist.");
        setLoading(false);
        return;
      }
      try {
        const response = await api.triage.get(triageId);
        const mapped = mapTriageResponse(response);
        setTriage(mapped);
        try {
          setCategory(await api.categories.get(response.category.slug));
        } catch {
          // Resource listing is a nice-to-have; ignore failures.
        }
        setEscalationContacts(response.escalation_contacts);
      } catch (err) {
        setError(
          err instanceof ApiError ? String(err.detail) : "Couldn't load this recommendation."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [triageId]);

  // Appointments require a case; create one (or reuse an escalation's) before booking.
  const ensureCaseReference = async (): Promise<string> => {
    if (!triage?.triageId) throw new Error("Missing triage id");
    if (triage.caseReference) return triage.caseReference;
    await ensureAuth();
    const created = await api.cases.create({ triage_id: triage.triageId });
    return created.reference;
  };

  const handleBookAppointment = async () => {
    if (!triage) return;
    setIsBooking(true);
    try {
      const reference = await ensureCaseReference();
      router.push(
        `/appointments?case=${encodeURIComponent(reference)}&category=${encodeURIComponent(triage.recommendedServiceId)}&service=${encodeURIComponent(triage.recommendedService)}`
      );
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Couldn't start a booking.");
      setIsBooking(false);
    }
  };

  const handleHandoffConfirm = async () => {
    setIsHandoffModalOpen(false);
    await handleBookAppointment();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 w-full flex items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading your recommendation...</span>
      </div>
    );
  }

  if (error || !triage) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 w-full text-center space-y-4">
        <p className="text-slate-300">{error ?? "Something went wrong."}</p>
        <Link href="/chat" className="inline-flex items-center gap-2 text-emerald-400 font-semibold hover:text-emerald-300">
          <span>Start a new conversation</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Page Title & Breadcrumb */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/chat" className="hover:text-emerald-400 transition">Triage Chat</Link>
          <span>/</span>
          <span className="text-white">Recommendation</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Here&apos;s your recommended support path
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Based on your conversation, we matched you with the most direct university resource.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsExplainModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 text-xs font-semibold transition"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Why am I being routed here?</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* Main Support Recommendation Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Primary Recommendation
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400">{triage.category}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {triage.recommendedService}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
                {triage.summary}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex sm:flex-col items-start sm:items-end gap-2">
            <span className="text-xs text-slate-500">Urgency Assessment</span>
            <PriorityBadge level={triage.level} size="md" customLabel={triage.priorityBadge.label} />
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-500 block">Response SLA</span>
              <span className="font-semibold text-white">{triage.expectedResponse}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-500 block">Confidentiality</span>
              <span className="font-semibold text-white">Protected University Case</span>
            </div>
          </div>
        </div>

        {/* Safety escalation contacts */}
        {triage.level === 4 && escalationContacts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {escalationContacts.map((contact) => (
              <a
                key={contact.name}
                href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col gap-1 hover:bg-red-500/20 transition"
              >
                <div className="flex items-center gap-2 text-red-300 text-xs font-bold uppercase tracking-wider">
                  <PhoneCall className="w-3.5 h-3.5" />
                  {contact.name}
                </div>
                <span className="text-white font-mono text-sm">{contact.phone}</span>
                <span className="text-[11px] text-slate-400">{contact.available} &bull; {contact.description}</span>
              </a>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            disabled={isBooking}
            onClick={handleBookAppointment}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition text-sm sm:text-base"
          >
            {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4 stroke-[2.5]" />}
            <span>Book an Appointment</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHandoffModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-white font-semibold px-6 py-3.5 rounded-xl border border-slate-700 transition text-sm sm:text-base"
          >
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>Talk to a Person</span>
          </button>

          <Link
            href="/resources"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-medium px-5 py-3.5 rounded-xl border border-slate-700/60 transition text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore Resources</span>
          </Link>
        </div>
      </div>

      {/* Supplementary resources from the matched category */}
      {category && category.resources.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Immediate & Supplementary Resources
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {category.resources.map((resource) => (
              <div
                key={resource.url}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {category.name}
                  </span>
                  <h4 className="text-base font-bold text-white">{resource.title}</h4>
                </div>
                <Link
                  href={resource.url}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
                >
                  <span>Read guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explainable Modal */}
      <ExplainableModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        triage={triage}
      />

      {/* Human Handoff Modal */}
      <HandoffModal
        isOpen={isHandoffModalOpen}
        onClose={() => setIsHandoffModalOpen(false)}
        onConfirm={handleHandoffConfirm}
        triage={triage}
      />
    </div>
  );
}

export default function RecommendationPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto py-20 text-center text-slate-400">Loading recommendations...</div>}>
      <RecommendationContent />
    </Suspense>
  );
}
