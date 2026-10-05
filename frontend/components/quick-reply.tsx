import React from "react";

interface QuickReplyProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export function QuickReply({ options, onSelect, disabled }: QuickReplyProps) {
  if (!options || options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2 animate-fadeIn">
      {options.map((opt, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(opt)}
          className="text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
