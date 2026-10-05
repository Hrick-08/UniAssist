"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Compass, 
  Menu, 
  X, 
  ShieldCheck, 
  Languages, 
  MessageSquare, 
  UserCheck, 
  MapPin, 
  BookOpen, 
  Clock3 
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"English" | "Hindi" | "Hinglish">("English");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "AI Triage", href: "/chat" },
    { label: "Campus Map", href: "/support" },
    { label: "Resources", href: "/resources" },
    { label: "My Requests", href: "/requests" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-900/85 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20"
          : "bg-slate-900/60 backdrop-blur-sm border-b border-slate-800/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  Uni<span className="text-emerald-400">Assist</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Student Portal
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                University Triage & Support
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/40 p-1.5 rounded-full border border-slate-700/50">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition"
              >
                <Languages className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1 z-50">
                  {(["English", "Hindi", "Hinglish"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition ${
                        language === lang
                          ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                          : "text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Anonymous Mode Indicator Toggle */}
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              title="Click to toggle session privacy"
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
                isAnonymous
                  ? "bg-purple-950/60 text-purple-300 border-purple-500/40"
                  : "bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800"
              }`}
            >
              {isAnonymous ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Incognito Mode</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Student ID: Verified</span>
                </>
              )}
            </button>

            {/* Talk to UniAssist CTA */}
            <Link
              href="/chat"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
            >
              <MessageSquare className="w-4 h-4 fill-slate-950" />
              <span>Talk to UniAssist</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/chat"
              className="bg-emerald-500 text-slate-950 p-2 rounded-lg text-xs font-semibold flex items-center justify-center"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg bg-slate-800/80 border border-slate-700"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Confidential & Safe</span>
            </div>
            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Start Chat
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
