"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface SectionBackgroundProps {
  variant?: "default" | "gradient" | "mesh" | "dots" | "hero";
  className?: string;
  children: React.ReactNode;
}

const backgroundVariants = {
  default: "bg-white dark:bg-slate-900",
  gradient: "bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-700/30",
  mesh: "bg-white dark:bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/20 via-transparent to-purple-50/20 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10",
  dots: "bg-white dark:bg-slate-900 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.1)_1px,transparent_0)] bg-[length:20px_20px]",
  hero: "relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-700/30 overflow-hidden",
};

export function SectionBackground({
  variant = "default",
  className,
  children,
}: SectionBackgroundProps) {
  return (
    <section className={cn(backgroundVariants[variant], className)}>
      {variant === "hero" && (
        <>
          {/* Floating orbs for hero variant */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </section>
  );
}

// Preset variants for specific sections
export function HeroBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SectionBackground variant="hero" className={cn("min-h-screen", className)}>
      {children}
    </SectionBackground>
  );
}

export function FeatureBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SectionBackground variant="gradient" className={cn("py-20", className)}>
      {children}
    </SectionBackground>
  );
}

export function TestimonialBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SectionBackground variant="mesh" className={cn("py-16", className)}>
      {children}
    </SectionBackground>
  );
}

export function AboutBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SectionBackground variant="dots" className={cn("py-20", className)}>
      {children}
    </SectionBackground>
  );
}
