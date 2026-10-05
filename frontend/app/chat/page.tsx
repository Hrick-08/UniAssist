"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Bot, 
  Send, 
  Mic, 
  Paperclip, 
  ShieldCheck, 
  UserCheck, 
  EyeOff, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  ChevronRight, 
  ArrowRight,
  AlertTriangle,
  History,
  GraduationCap
} from "lucide-react";
import { 
  ChatMessage, 
  INITIAL_BOT_MESSAGE, 
  evaluateTriage, 
  TriageResult,
  URGENT_KEYWORDS 
} from "@/data/triage-flows";
import { ChatMessageItem } from "@/components/chat-message";
import { TypingIndicator } from "@/components/typing-indicator";
import { SupportPath } from "@/components/support-path";
import { PriorityBadge } from "@/components/priority-badge";
import { ExplainableModal } from "@/components/explainable-modal";
import { UrgentSupportBanner } from "@/components/urgent-support-banner";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_BOT_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [conversationStep, setConversationStep] = useState<number>(0);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [currentTriage, setCurrentTriage] = useState<TriageResult | null>(null);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isUrgentTriggered, setIsUrgentTriggered] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<"chat" | "path">("chat");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle category preset if navigated from landing page
  useEffect(() => {
    if (initialCategory) {
      const presetMessages: Record<string, string> = {
        academic: "I'm struggling with coursework, exams and assignment deadlines.",
        financial: "I need information regarding fee installments and scholarship verification.",
        wellbeing: "I've been feeling extremely stressed, anxious and overwhelmed.",
        safety: "I need to speak with campus security about a harassment concern."
      };

      const presetText = presetMessages[initialCategory] || `I need help regarding ${initialCategory}.`;
      handleUserSubmit(presetText);
    }
  }, [initialCategory]);

  // Main message submission handler
  const handleUserSubmit = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: "Just now"
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Check for urgent safety concern
    const lower = text.toLowerCase();
    if (URGENT_KEYWORDS.some((kw) => lower.includes(kw))) {
      setTimeout(() => {
        setIsTyping(false);
        setIsUrgentTriggered(true);
        const triage = evaluateTriage([text]);
        setCurrentTriage(triage);
        setConversationStep(3);

        const urgentBotMsg: ChatMessage = {
          id: `bot-urgent-${Date.now()}`,
          sender: "bot",
          text: "I hear you, and your safety is our utmost priority right now. I've flagged this for immediate human and security dispatch.",
          timestamp: "Just now",
          isUrgent: true,
          triageData: triage
        };
        setMessages((prev) => [...prev, urgentBotMsg]);
      }, 700);
      return;
    }

    // Step-by-step triage conversation flow
    setTimeout(() => {
      setIsTyping(false);

      if (conversationStep === 0) {
        // First reply: Ask follow-up question
        setConversationStep(1);
        const botReply: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "That sounds difficult. Let's narrow this down so I can point you toward the right support.",
          timestamp: "Just now",
          quickReplies: [
            "Exam pressure",
            "Too much workload",
            "Can't understand subjects",
            "Attendance concerns",
            "Something else"
          ]
        };
        setMessages((prev) => [...prev, botReply]);
      } else if (conversationStep === 1) {
        // Follow-up: Ask severity / impact
        setConversationStep(2);
        setSelectedSubtopic(text);
        const botReply: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "How much is this affecting you right now?",
          timestamp: "Just now",
          quickReplies: [
            "Mostly manageable",
            "It's affecting my studies",
            "I'm struggling to keep up",
            "I need help urgently"
          ]
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        // Step 3: Triage Complete
        setConversationStep(3);
        setSelectedSeverity(text);

        const allUserTexts = messages
          .filter((m) => m.sender === "user")
          .map((m) => m.text)
          .concat(text);

        const result = evaluateTriage(allUserTexts, text);
        setCurrentTriage(result);

        const botReply: ChatMessage = {
          id: `bot-result-${Date.now()}`,
          sender: "bot",
          text: `Thank you for sharing that with me.\n\nBased on what you've described, I've identified your concern as **${result.category}** (${result.subcategory}) with **${result.priorityBadge.label}**.\n\nI recommend connecting with the **${result.recommendedService}** to help you take the next step.`,
          timestamp: "Just now",
          triageData: result
        };
        setMessages((prev) => [...prev, botReply]);
      }
    }, 900);
  };

  const handleQuickReply = (option: string) => {
    handleUserSubmit(option);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden items-center justify-between mb-4 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTabMobile("chat")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
            activeTabMobile === "chat"
              ? "bg-emerald-500 text-slate-950 shadow"
              : "text-slate-400"
          }`}
        >
          Chat Conversation
        </button>
        <button
          onClick={() => setActiveTabMobile("path")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
            activeTabMobile === "path"
              ? "bg-emerald-500 text-slate-950 shadow"
              : "text-slate-400"
          }`}
        >
          Support Path
        </button>
      </div>

      {/* 3-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">
          {/* Mode Switch Card */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Session Profile
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                  !isAnonymous
                    ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                    : "bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Standard Session</p>
                  <p className="text-[10px] text-slate-400">Save case & appointments</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                  isAnonymous
                    ? "bg-purple-500/15 border-purple-500/30 text-white"
                    : "bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Anonymous Mode</p>
                  <p className="text-[10px] text-slate-400">No profile link created</p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Support Categories */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Quick Jump Categories
            </span>
            <div className="space-y-1.5 text-xs">
              {[
                { name: "Academic & Exams", query: "I'm overwhelmed with exams and coursework" },
                { name: "Tuition & Financial Aid", query: "I need help with my semester tuition installment" },
                { name: "Stress & Wellbeing", query: "I feel completely burnt out and need counseling" },
                { name: "Hostel & Facilities", query: "My hostel room has broken facilities" }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUserSubmit(item.query)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center justify-between group"
                >
                  <span className="truncate">{item.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-[11px] text-slate-500 p-3 rounded-xl border border-slate-800/60 bg-slate-900/40 space-y-1">
            <p className="font-semibold text-slate-400">Notice</p>
            <p>UniAssist is a student support triage tool. It routes you to proper university human staff and does not provide clinical medical diagnoses.</p>
          </div>
        </aside>

        {/* CENTER COLUMN: Active Chat Conversation */}
        <main
          className={`lg:col-span-6 flex flex-col h-[750px] bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden ${
            activeTabMobile === "chat" ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Bot className="w-5 h-5 text-slate-950" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-tight">UniAssist</h2>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ● Available
                  </span>
                </div>
                <p className="text-xs text-slate-400">Student Support Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAnonymous && (
                <span className="hidden sm:inline-flex text-[11px] font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                  Anonymous Session
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setMessages([INITIAL_BOT_MESSAGE]);
                  setConversationStep(0);
                  setCurrentTriage(null);
                  setIsUrgentTriggered(false);
                }}
                title="Reset conversation"
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Message Scrollable Container */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-2">
            {/* Urgent Support Banner if triggered */}
            {isUrgentTriggered && (
              <div className="mb-4">
                <UrgentSupportBanner />
              </div>
            )}

            {messages.map((msg, index) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onSelectQuickReply={handleQuickReply}
                isLast={index === messages.length - 1}
              />
            ))}

            {isTyping && <TypingIndicator />}

            {/* Inline Triage Result Confirmation Card if triage complete */}
            {currentTriage && conversationStep >= 3 && !isUrgentTriggered && (
              <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 shadow-xl space-y-4 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Triage Evaluation Complete
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Here&apos;s what I understand
                    </h3>
                  </div>
                  <PriorityBadge level={currentTriage.level} size="sm" customLabel={currentTriage.priorityBadge.label} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Support Category</span>
                    <span className="font-semibold text-white text-sm">{currentTriage.category}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Subcategory</span>
                    <span className="font-semibold text-white text-sm">{currentTriage.subcategory}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-500 block">Recommended University Support</span>
                  <p className="text-sm font-bold text-emerald-400">{currentTriage.recommendedService}</p>
                  <p className="text-xs text-slate-400">Expected response: {currentTriage.expectedResponse}</p>
                </div>

                {/* Explainable AI Trigger */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setIsExplainModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why am I being routed here?</span>
                  </button>
                  <span className="text-[11px] text-slate-500">Not a clinical diagnosis</span>
                </div>

                {/* Continue Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-800">
                  <Link
                    href={`/recommendation?category=${encodeURIComponent(currentTriage.category)}&sub=${encodeURIComponent(currentTriage.subcategory)}&level=${currentTriage.level}&service=${encodeURIComponent(currentTriage.recommendedService)}`}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition shadow-md shadow-emerald-500/20"
                  >
                    <span>Yes, continue to recommendations</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setConversationStep(1);
                      const retryMsg: ChatMessage = {
                        id: `bot-retry-${Date.now()}`,
                        sender: "bot",
                        text: "No problem. Let's adjust. Which area best describes your current issue?",
                        timestamp: "Just now",
                        quickReplies: ["Academic", "Financial", "Wellbeing", "Campus Life", "Safety"]
                      };
                      setMessages((prev) => [...prev, retryMsg]);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs sm:text-sm font-semibold transition"
                  >
                    Change something
                  </button>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserSubmit(inputText);
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                title="Attach document or screenshot (Simulated)"
                onClick={() => alert("File attachment simulated. Students can attach medical notes, fee receipts, or syllabus files.")}
                className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                title="Voice input (Simulated)"
                onClick={() => {
                  setInputText("I'm struggling to manage my classes and exams.");
                }}
                className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tell me what's going on in your own words..."
                className="flex-1 bg-slate-800/80 text-white placeholder-slate-400 text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold transition shadow-md shadow-emerald-500/20"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </main>

        {/* RIGHT COLUMN: Support Path & Live Journey (Desktop & Mobile tab) */}
        <aside
          className={`lg:col-span-3 space-y-4 ${
            activeTabMobile === "path" ? "block" : "hidden lg:block"
          }`}
        >
          <SupportPath
            currentStepIndex={conversationStep}
            categoryName={currentTriage?.category || (selectedSubtopic ? "Academic" : "Identifying category...")}
            subcategoryName={currentTriage?.subcategory || (selectedSubtopic || "Assessing subcategory...")}
            recommendedService={currentTriage?.recommendedService || "Evaluating best service..."}
            actionName={conversationStep >= 3 ? "Recommendation ready" : "Next step"}
          />

          {/* Triage Preview Card if available */}
          {currentTriage && (
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Action Pathway
              </span>
              <div className="text-xs text-slate-300 space-y-2">
                <p>
                  Urgency: <span className="font-semibold text-white">{currentTriage.levelLabel}</span>
                </p>
                <p>
                  Confidence: <span className="font-semibold text-emerald-400">{currentTriage.confidenceScore}%</span>
                </p>
                <Link
                  href={`/recommendation?category=${encodeURIComponent(currentTriage.category)}&sub=${encodeURIComponent(currentTriage.subcategory)}&level=${currentTriage.level}&service=${encodeURIComponent(currentTriage.recommendedService)}`}
                  className="block text-center w-full py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 rounded-xl font-bold transition mt-2 border border-slate-700"
                >
                  View Full Recommendation →
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Explainable AI Modal */}
      {currentTriage && (
        <ExplainableModal
          isOpen={isExplainModalOpen}
          onClose={() => setIsExplainModalOpen(false)}
          triage={currentTriage}
        />
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto py-20 text-center text-slate-400">Loading triage session...</div>}>
      <ChatContent />
    </Suspense>
  );
}
