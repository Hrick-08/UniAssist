"use client";

import React from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  Coins, 
  HeartPulse, 
  Home, 
  ShieldAlert, 
  Briefcase, 
  Users, 
  FileText, 
  ArrowRight 
} from "lucide-react";
import { Category } from "@/data/categories";

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Coins,
  HeartPulse,
  Home,
  ShieldAlert,
  Briefcase,
  Users,
  FileText,
};

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon] || GraduationCap;

  return (
    <Link
      href={`/chat?category=${category.id}`}
      className="group relative flex flex-col justify-between p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1"
    >
      <div>
        {/* Header Icon + Name */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-500/40 transition-transform">
            <IconComponent className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
          </div>
          <span className="text-xs font-medium text-slate-500 group-hover:text-slate-400 transition-colors flex items-center gap-1">
            Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white tracking-tight mb-2 group-hover:text-emerald-300 transition-colors">
          {category.name}
        </h3>

        <p className="text-sm text-slate-400 leading-relaxed mb-4">
          {category.description}
        </p>

        {/* Subcategories tags */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
          {category.subcategories.slice(0, 3).map((sub, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/40"
            >
              {sub}
            </span>
          ))}
          {category.subcategories.length > 3 && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/40 text-slate-500">
              +{category.subcategories.length - 3} more
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
