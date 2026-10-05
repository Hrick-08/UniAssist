"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  User, 
  Download, 
  ArrowLeft, 
  Sparkles,
  ShieldCheck,
  Check
} from "lucide-react";
import { MOCK_APPOINTMENT_SCHEDULE } from "@/data/mock-appointments";

function AppointmentsContent() {
  const searchParams = useSearchParams();
  const serviceName = searchParams.get("service") || "Academic Advising Center";

  // State
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(2); // Default to Thursday, October 8
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>("2:30 PM"); // Default to 2:30 PM for demo flow
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [appointmentRef, setAppointmentRef] = useState<string>("APT-8821");

  const currentSchedule = MOCK_APPOINTMENT_SCHEDULE[selectedDayIndex];

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/recommendation"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Recommendation</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {isConfirmed ? "Appointment Confirmed" : "Schedule Support Appointment"}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-1">
          {isConfirmed
            ? "Your consultation has been secured with the designated university team."
            : `Select an available timeslot to meet with a verified advisor from ${serviceName}.`}
        </p>
      </div>

      {!isConfirmed ? (
        /* Booking Interface */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Date & Slot Selection */}
          <div className="md:col-span-8 bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            {/* Step 1: Select Date */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <span>1. Select Date</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {MOCK_APPOINTMENT_SCHEDULE.map((day, idx) => {
                  const isSelected = selectedDayIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedDayIndex(idx);
                        // Pick first available slot of the day
                        const firstAvail = day.slots.find((s) => s.available);
                        if (firstAvail) setSelectedSlotTime(firstAvail.time);
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-950/30"
                          : "bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <span className="block text-xs font-medium">{day.dateShort.split(",")[0]}</span>
                      <span className="block text-sm font-bold text-white mt-0.5">
                        {day.dateShort.split(",")[1]}
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
                <span>2. Available Time Slots for {currentSchedule.date}</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentSchedule.slots.map((slot) => {
                  const isSelected = selectedSlotTime === slot.time;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlotTime(slot.time)}
                      className={`py-3 px-3 rounded-xl border text-center text-xs sm:text-sm font-semibold transition-all ${
                        !slot.available
                          ? "bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20"
                          : "bg-slate-800/60 border-slate-700/80 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800"
                      }`}
                    >
                      {slot.time}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-emerald-500/40 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-bold">In-Person Meeting</p>
                      <p className="text-[11px] text-slate-400">Student Support Center, Room 304</p>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800 text-slate-400 flex items-center justify-between opacity-70">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="font-bold">Virtual Video Link</p>
                      <p className="text-[11px] text-slate-500">Secure university MS Teams</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/25"
              >
                Confirm Appointment →
              </button>
            </div>
          </div>

          {/* Right: Booking Summary Card */}
          <div className="md:col-span-4 bg-slate-900/60 rounded-3xl border border-slate-800 p-6 space-y-5">
            <h3 className="text-sm font-bold text-white tracking-tight uppercase tracking-wider text-slate-400">
              Booking Summary
            </h3>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500">Service</span>
                <p className="text-sm font-bold text-emerald-400">{serviceName}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500">Selected Slot</span>
                <p className="text-sm font-bold text-white">
                  {currentSchedule.date} at {selectedSlotTime}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500">Advisor Assigned</span>
                <p className="text-sm font-bold text-white">Dr. Sarah Jenkins</p>
                <p className="text-[11px] text-slate-400">Senior Academic Workload Advisor</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400 border-t border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Confidential appointment under university student support policy.</span>
            </div>
          </div>
        </div>
      ) : (
        /* Confirmed Appointment State (Requirement #13 & Demo flow) */
        <div className="max-w-2xl mx-auto bg-slate-900/90 rounded-3xl border border-emerald-500/40 p-8 sm:p-12 shadow-2xl space-y-8 text-center animate-scaleUp">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              ✓ Appointment Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-2">
              Academic Advisor Consultation
            </h2>
            <p className="text-slate-400 text-sm">
              Reference Code: <span className="font-mono text-emerald-400 font-bold">{appointmentRef}</span>
            </p>
          </div>

          {/* Key Details Card */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-slate-400">Team</span>
              <span className="font-semibold text-white">Academic Advising Center</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-slate-400">Date & Time</span>
              <span className="font-bold text-emerald-400">
                {currentSchedule.date}, {selectedSlotTime}
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-slate-400">Location</span>
              <span className="font-semibold text-white">Student Support Center, Room 304</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Advisor</span>
              <span className="font-semibold text-white">Dr. Sarah Jenkins</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => alert("Calendar invite (.ics) simulated download.")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-sm border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Add to Calendar</span>
            </button>

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
