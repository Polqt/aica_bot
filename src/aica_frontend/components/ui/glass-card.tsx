"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "strong" | "subtle" | "colored";
  glassTint?: "blue" | "purple" | "neutral";
}

const glassVariants = {
  default: "bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-0 shadow-xl shadow-black/5 dark:shadow-xl",
  strong: "bg-white/95 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/30 shadow-2xl shadow-black/10 dark:shadow-2xl",
  subtle: "bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/20 shadow-lg shadow-black/5 dark:shadow-lg",
  colored: "bg-gradient-to-br from-white/90 via-blue-50/80 to-purple-50/80 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-blue-200/30 dark:border-slate-700/20 shadow-xl shadow-blue-500/10 dark:shadow-xl",
};

const glassTints = {
  blue: "border-blue-200/50 dark:border-blue-800/30 shadow-blue-500/10",
  purple: "border-purple-200/50 dark:border-purple-800/30 shadow-purple-500/10",
  neutral: "border-slate-200/50 dark:border-slate-700/30 shadow-black/5",
};

export function GlassCard({
  className,
  variant = "default",
  glassTint = "neutral",
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-300 hover:shadow-2xl",
        glassVariants[variant],
        variant !== "colored" && glassTints[glassTint],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Preset variants for common use cases
export function FeatureGlassCard({ children, className, ...props }: Omit<GlassCardProps, "variant">) {
  return (
    <GlassCard variant="default" glassTint="blue" className={cn("p-6", className)} {...props}>
      {children}
    </GlassCard>
  );
}

export function HeroGlassCard({ children, className, ...props }: Omit<GlassCardProps, "variant">) {
  return (
    <GlassCard variant="strong" glassTint="purple" className={cn("p-8", className)} {...props}>
      {children}
    </GlassCard>
  );
}

export function TestimonialGlassCard({ children, className, ...props }: Omit<GlassCardProps, "variant">) {
  return (
    <GlassCard variant="subtle" glassTint="neutral" className={cn("p-6", className)} {...props}>
      {children}
    </GlassCard>
  );
}

export function StatsGlassCard({ children, className, ...props }: Omit<GlassCardProps, "variant">) {
  return (
    <GlassCard variant="colored" className={cn("p-4 text-center", className)} {...props}>
      {children}
    </GlassCard>
  );
}
