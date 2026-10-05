"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Check,
  Loader2
} from "lucide-react";
import { api, ApiError, AppointmentOut, Slot } from "@/lib/api";

interface DayGroup {
  dateLabel: string;
  dateShort: string;
  slots: Slot[];
}

function groupSlotsByDay(slots: Slot[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  for (const slot of slots) {
    const d = new Date(slot.starts_at);
    const key = d.toDateString();
    if (!groups.has(key)) {
      groups.set(key, {
        dateLabel: d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
        dateShort: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
        slots: []
      });
    }
    groups.get(key)!.slots.push(slot);
  }
  return Array.from(groups.values());
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function AppointmentsContent() {
  const searchParams = useSearchParams();
  const caseReference = searchParams.get("case");
  const categorySlug = searchParams.get("category");
  const serviceName = searchParams.get("service") || "your support team";

  const [teamName, setTeamName] = useState<string>(serviceName);
  const [days, setDays] = useState<DayGroup[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [confirmed, setConfirmed] = useState<AppointmentOut | null>(null);

  useEffect(() => {
    (async () => {
      if (!categorySlug || !caseReference) {
        setError("Start from a triage recommendation to book an appointment with the right team.");
        setLoading(false);
        return;
      }
      try {
        const availability = await api.appointments.available(categorySlug);
        setTeamName(availability.team_name);
        const grouped = groupSlotsByDay(availability.slots);
        setDays(grouped);
        const firstSlot = grouped[0]?.slots[0] ?? null;
        setSelectedSlot(firstSlot);
      } catch (err) {
        setError(err instanceof ApiError ? String(err.detail) : "Couldn't load available slots.");
      } finally {
        setLoading(false);
      }
    })();
  }, [categorySlug, caseReference]);

  const currentDay = days[selectedDayIndex];

  const handleConfirm = async () => {
    if (!caseReference || !selectedSlot) return;
    setIsBooking(true);
    setError(null);
    try {
      const appointment = await api.appointments.create({
        case_reference: caseReference,
        starts_at: selectedSlot.starts_at
      });
      setConfirmed(appointment);
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Couldn't book that slot.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Requests</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {confirmed ? "Appointment Confirmed" : "Schedule Support Appointment"}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-1">
          {confirmed
            ? "Your consultation has been secured with the designated university team."
            : `Select an available timeslot to meet with ${teamName}.`}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 text-slate-400 py-20">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading available slots...</span>
        </div>
      ) : !caseReference || !categorySlug ? (
        <div className="text-center py-10">
          <Link href="/chat" className="text-emerald-400 font-semibold hover:text-emerald-300">
            Start a triage conversation →
          </Link>
        </div>
      ) : !confirmed ? (
        /* Booking Interface */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Date & Slot Selection */}
          <div className="md:col-span-8 bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            {days.length === 0 ? (
              <p className="text-slate-400 text-sm">No available slots right now. Please check back soon.</p>
            ) : (
              <>
                {/* Step 1: Select Date */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-emerald-400" />
                    <span>1. Select Date</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {days.map((day, idx) => {
                      const isSelected = selectedDayIndex === idx;
                      return (
                        <button
                          key={day.dateShort}
                          type="button"
                          onClick={() => {
                            setSelectedDayIndex(idx);
                            setSelectedSlot(day.slots[0] ?? null);
                          }}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            isSelected
                              ? "bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-950/30"
                              : "bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          <span className="block text-xs font-medium">{day.dateShort.split(",")[0]}</span>
                          <span className="block text-sm font-bold text-white mt-0.5">
                            {day.dateShort.split(",").slice(1).join(",")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Select Time Slot */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>2. Available Time Slots for {currentDay?.dateLabel}</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {currentDay?.slots.map((slot) => {
                      const isSelected = selectedSlot?.starts_at === slot.starts_at;
                      return (
                        <button
                          key={slot.starts_at}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-3 rounded-xl border text-center text-xs sm:text-sm font-semibold transition-all ${
                            isSelected
                              ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20"
                              : "bg-slate-800/60 border-slate-700/80 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800"
                          }`}
                        >
                          {formatTime(slot.starts_at)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Consultation Format */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    3. Consultation Format
                  </label>
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-emerald-500/40 text-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-bold">In-Person Meeting</p>
                        <p className="text-[11px] text-slate-400">{teamName}</p>
                      </div>
                    </div>
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    disabled={!selectedSlot || isBooking}
                    onClick={handleConfirm}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    {isBooking && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Confirm Appointment →</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right: Booking Summary Card */}
          <div className="md:col-span-4 bg-slate-900/60 rounded-3xl border border-slate-800 p-6 space-y-5">
            <h3 className="text-sm font-bold text-white tracking-tight uppercase tracking-wider text-slate-400">
              Booking Summary
            </h3>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500">Team</span>
                <p className="text-sm font-bold text-emerald-400">{teamName}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500">Selected Slot</span>
                <p className="text-sm font-bold text-white">
                  {selectedSlot ? `${currentDay?.dateLabel} at ${formatTime(selectedSlot.starts_at)}` : "None selected"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500">Case Reference</span>
                <p className="text-sm font-bold text-white">{caseReference}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400 border-t border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Confidential appointment under university student support policy.</span>
            </div>
          </div>
        </div>
      ) : (
        /* Confirmed Appointment State */
        <div className="max-w-2xl mx-auto bg-slate-900/90 rounded-3xl border border-emerald-500/40 p-8 sm:p-12 shadow-2xl space-y-8 text-center animate-scaleUp">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              ✓ Appointment Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-2">
              {confirmed.team_name} Consultation
            </h2>
            <p className="text-slate-400 text-sm">
              Case Reference: <span className="font-mono text-emerald-400 font-bold">{confirmed.case_reference}</span>
            </p>
          </div>

          {/* Key Details Card */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-slate-400">Team</span>
              <span className="font-semibold text-white">{confirmed.team_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Date & Time</span>
              <span className="font-bold text-emerald-400">
                {new Date(confirmed.starts_at).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit"
                })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/requests"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-md shadow-emerald-500/20"
            >
              <span>Track in My Requests →</span>
            </Link>

            <Link
              href="/support"
              className="w-full sm:w-auto text-xs text-slate-400 hover:text-white px-4 py-2 transition"
            >
              Back to Support Map
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto py-20 text-center text-slate-400">Loading appointments...</div>}>
      <AppointmentsContent />
    </Suspense>
  );
}
