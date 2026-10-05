import React from "react";

interface PriorityBadgeProps {
  level: 1 | 2 | 3 | 4;
  customLabel?: string;
  size?: "sm" | "md" | "lg";
}

export function PriorityBadge({ level, customLabel, size = "md" }: PriorityBadgeProps) {
  const configs = {
    1: {
      defaultLabel: "General Guidance",
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
      icon: "🟢"
    },
    2: {
      defaultLabel: "Support Recommended",
      bg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      dot: "bg-amber-400",
      icon: "🟡"
    },
    3: {
      defaultLabel: "Priority Support",
      bg: "bg-orange-500/10 text-orange-300 border-orange-500/20",
      dot: "bg-orange-400",
      icon: "🟠"
    },
    4: {
      defaultLabel: "Immediate Escalation",
      bg: "bg-red-500/15 text-red-300 border-red-500/30 animate-pulse",
      dot: "bg-red-400",
      icon: "🔴"
    }
  };

  const config = configs[level] || configs[1];
  const label = customLabel || config.defaultLabel;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-3 py-1 text-xs sm:text-sm gap-2",
    lg: "px-4 py-1.5 text-sm sm:text-base gap-2.5 font-semibold"
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} shrink-0`} />
      <span>{label}</span>
    </span>
  );
}
