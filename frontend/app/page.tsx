import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  EyeOff, 
  HeartHandshake, 
  CheckCircle2, 
  MessageSquare,
  HelpCircle,
  Clock,
  Compass
} from "lucide-react";
import { Hero } from "@/components/hero";
import { CategoryCard } from "@/components/category-card";
import { CATEGORIES } from "@/data/categories";

export default function HomePage() {
  const steps = [
    {
      number: "01",
      title: "Tell us what's going on",
      description: "Explain your problem in your own words, using whatever language feels most natural. No technical university jargon required."
    },
    {
      number: "02",
      title: "UniAssist understands",
      description: "Our triage engine evaluates your intent, maps it across university departments, and assesses urgency without diagnosing."
    },
    {
      number: "03",
      title: "Get the right support path",
      description: "Receive a transparent recommendation with explainable reasoning—whether it's self-help resources, an advisor, or emergency assistance."
    },
    {
      number: "04",
      title: "Take the next step",
      description: "Instantly schedule an appointment, review exactly what information is shared with staff, and track your request to resolution."
    }
  ];

  const privacyFeatures = [
    {
      icon: EyeOff,
      title: "Anonymous Option",
      description: "Get full triage guidance and recommendations without signing in or linking a university profile."
    },
    {
      icon: ShieldCheck,
      title: "Privacy-First Architecture",
      description: "Your conversations are confidential and retained only for your active session unless you choose to create a case."
    },
    {
      icon: UserCheck,
      title: "Student-Controlled Sharing",
      description: "Before connecting with university staff, you review a clear summary of what will be shared."
    },
    {
      icon: HeartHandshake,
      title: "Human Support at the Core",
      description: "AI assists with initial navigation and triage—licensed advisors and university staff handle the care."
    }
  ];

  return (
    <div className="flex flex-col gap-16 lg:gap-24 pb-16">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Support Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400">
            <Compass className="w-3.5 h-3.5" />
            <span>Comprehensive University Coverage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Support for whatever you&apos;re facing
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-normal">
            Select a category to jump right in, or describe your situation in chat to let UniAssist guide you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 3. How It Works (Connected Timeline Stepper) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Clear & Transparent Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How UniAssist Works
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Four simple steps from feeling stuck to meeting the right support team.
            </p>
          </div>

          {/* Stepper Grid with connecting line */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((s, idx) => (
              <div key={idx} className="relative flex flex-col space-y-3 group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold flex items-center justify-center text-lg group-hover:scale-105 group-hover:border-emerald-400 transition-all shadow-md shadow-emerald-950/20">
                    {s.number}
                  </div>
                  <div className="h-0.5 flex-1 bg-slate-800 hidden lg:block group-hover:bg-emerald-500/30 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight pt-1">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-normal">
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition shadow-md shadow-emerald-500/20"
            >
              <span>Try UniAssist Triage Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Privacy Section: Your concern. Your choice. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Built on Trust & Transparency</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Your concern. Your choice.
          </h2>
          <p className="text-base text-slate-400">
            We understand reaching out for support can feel intimidating. UniAssist is designed to place you in full control of your session.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {privacyFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition flex flex-col space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
