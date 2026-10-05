import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "UniAssist — AI-Powered University Student Support & Triage",
  description: "Find the right support. Without the runaround. Single front door for university academic, financial, wellbeing, and campus services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark antialiased`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
        <Navbar />
        <main className="flex-1">{children}</main>
        
        {/* Universal Student Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">UniAssist</span>
              <span>• Student Support & Triage Platform</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Emergency 24/7 Dispatch: +1 (555) 911-SAFE</span>
              <span>•</span>
              <a href="/support" className="hover:text-emerald-400 transition">Campus Map</a>
              <span>•</span>
              <a href="/resources" className="hover:text-emerald-400 transition">Resources</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
