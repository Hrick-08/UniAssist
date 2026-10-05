"use client";

import React from "react";
import { Bot, User, AlertTriangle } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/data/triage-flows";
import { QuickReply } from "@/components/quick-reply";
import { PriorityBadge } from "@/components/priority-badge";

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectQuickReply?: (option: string) => void;
  isLast?: boolean;
}

export function ChatMessageItem({ message, onSelectQuickReply, isLast }: ChatMessageProps) {
  const isBot = message.sender === "bot";
  const isSystem = message.sender === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <span className="text-xs bg-slate-800/80 text-slate-400 px-3 py-1 rounded-full border border-slate-700/60">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 my-3 transition-all ${
        isBot ? "justify-start" : "justify-end"
      }`}
    >
      {/* Bot Avatar */}
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4 text-emerald-400" />
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${isBot ? "" : "items-end"}`}>
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isBot
              ? "rounded-tl-sm bg-slate-800/90 text-slate-100 border border-slate-700/60 shadow-sm"
              : "rounded-tr-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/20"
          }`}
        >
          <p className="whitespace-pre-line">{message.text}</p>

          {/* Urgent warning tag if flagged */}
          {message.isUrgent && (
            <div className="mt-3 pt-3 border-t border-red-500/30 flex items-center gap-2 text-xs text-red-300 font-medium">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Priority safety trigger activated</span>
            </div>
          )}
        </div>

        {/* Message Timestamp */}
        <div
          className={`text-[11px] text-slate-500 px-1 flex items-center gap-2 ${
            isBot ? "justify-start" : "justify-end"
          }`}
        >
          <span>{message.timestamp}</span>
          {isBot && <span className="text-emerald-500/80">• Verified AI Triage</span>}
        </div>

        {/* Quick Replies if available and on latest message */}
        {isBot && isLast && message.quickReplies && message.quickReplies.length > 0 && onSelectQuickReply && (
          <QuickReply
            options={message.quickReplies}
            onSelect={onSelectQuickReply}
          />
        )}
      </div>

      {/* User Avatar */}
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4 text-slate-300" />
        </div>
      )}
    </div>
  );
}
