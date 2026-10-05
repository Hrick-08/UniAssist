import React from "react";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 my-2 animate-fadeIn">
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          <span className="text-xs text-slate-400 ml-2 font-medium">UniAssist is analyzing...</span>
        </div>
      </div>
    </div>
  );
}
