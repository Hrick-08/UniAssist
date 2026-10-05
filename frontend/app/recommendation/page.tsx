"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Calendar, 
  UserCheck, 
  BookOpen, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { PriorityBadge } from "@/components/priority-badge";
import { ExplainableModal } from "@/components/explainable-modal";
import { HandoffModal } from "@/components/handoff-modal";
import { TriageResult, evaluateTriage } from "@/data/triage-flows";

function RecommendationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category") || "Academic";
  const subcategoryParam = searchParams.get("sub") || "Exam & Workload";
  const levelParam = (Number(searchParams.get("level")) as 1 | 2 | 3 | 4) || 2;
  const serviceParam = searchParams.get("service") || "Academic Advising Center";

  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);

  const mockTriage: TriageResult = {
    category: categoryParam,
    subcategory: subcategoryParam,
    level: levelParam,
    levelLabel: levelParam === 3 ? "Level 3 — Priority Support" : "Level 2 — Support Recommended",
    levelColor: levelParam === 3 ? "orange" : "yellow",
    priorityBadge: {
      label: levelParam === 3 ? "HIGH — Priority Support" : "Support Recommended",
      bg: "bg-amber-50",
      text: "text-amber-800",
      dot: "bg-amber-500",
      border: "border-amber-300"
    },
    recommendedService: serviceParam,
    recommendedServiceId: "academic-advising",
    expectedResponse: "Within 24 hours",
    confidenceScore: 92,
    reasoning: [
      "You mentioned difficulty managing coursework and assignments",
      "You indicated upcoming exam pressure affecting study pace",
      "Assignments and class schedules are requiring workload balancing"
    ],
    suggestedAction: "recommend_support",
    summary: "Workload mitigation and exam balancing consultation recommended."
  };

  const handleHandoffConfirm = () => {
    setIsHandoffModalOpen(false);
    router.push("/appointments?service=" + encodeURIComponent(serviceParam));
  };

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
                <span className="text-xs text-slate-400">{categoryParam}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {serviceParam}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
                Get dedicated guidance on workload balancing, assignment extensions, and personalized exam preparation strategies.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex sm:flex-col items-start sm:items-end gap-2">
            <span className="text-xs text-slate-500">Urgency Assessment</span>
            <PriorityBadge level={levelParam} size="md" />
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-500 block">Response SLA</span>
              <span className="font-semibold text-white">Within 24 Hours</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-500 block">Location</span>
              <span className="font-semibold text-white">Student Hub, Block A, Room 304</span>
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/appointments?service=Academic%20Advising%20Center"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition text-sm sm:text-base"
          >
            <Calendar className="w-4 h-4 stroke-[2.5]" />
            <span>Book an Appointment</span>
          </Link>

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

      {/* Additional Immediate Support Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Immediate & Supplementary Resources
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Exam Planning Guide */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                Self-Help Guide
              </span>
              <h4 className="text-base font-bold text-white">Exam Period Workload Guide</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Proven revision timetables and stress mitigation techniques designed specifically for midterm exams.
              </p>
            </div>
            <Link
              href="/resources"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
            >
              <span>Read guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Peer Tutoring */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                Peer Support
              </span>
              <h4 className="text-base font-bold text-white">Free Peer Tutoring Directory</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with upper-year students who have previously aced your difficult modules.
              </p>
            </div>
            <Link
              href="/resources"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
            >
              <span>Find a tutor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Deadline Extension Policy */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Official Policy
              </span>
              <h4 className="text-base font-bold text-white">Assignment Extension Protocol</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step-by-step instructions on applying for formal Dean-approved coursework deferrals.
              </p>
            </div>
            <Link
              href="/resources"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
            >
              <span>Download policy PDF</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Explainable Modal */}
      <ExplainableModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        triage={mockTriage}
      />

      {/* Human Handoff Modal */}
      <HandoffModal
        isOpen={isHandoffModalOpen}
        onClose={() => setIsHandoffModalOpen(false)}
        onConfirm={handleHandoffConfirm}
        triage={mockTriage}
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
