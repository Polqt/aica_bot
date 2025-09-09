"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import * as React from "react";

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "pulse" | "bars";
  className?: string;
}

const spinnerSizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function LoadingSpinner({ 
  size = "md", 
  variant = "default",
  className 
}: LoadingSpinnerProps) {
  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("bg-blue-600 rounded-full", {
              "w-2 h-2": size === "sm",
              "w-3 h-3": size === "md",
              "w-4 h-4": size === "lg",
              "w-5 h-5": size === "xl",
            })}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <motion.div
        className={cn(
          "bg-gradient-to-r from-blue-500 to-purple-500 rounded-full",
          spinnerSizes[size],
          className
        )}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      />
    );
  }

  if (variant === "bars") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={cn("bg-blue-600", {
              "w-1 h-4": size === "sm",
              "w-1 h-6": size === "md",
              "w-1.5 h-8": size === "lg",
              "w-2 h-10": size === "xl",
            })}
            animate={{
              scaleY: [1, 2, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <Loader2 
      className={cn(
        "animate-spin text-blue-600",
        spinnerSizes[size],
        className
      )} 
    />
  );
}

// Skeleton Loader Component
interface SkeletonLoaderProps {
  variant?: "text" | "card" | "avatar" | "button" | "custom";
  lines?: number;
  className?: string;
  width?: string;
  height?: string;
}

export function SkeletonLoader({
  variant = "text",
  lines = 3,
  className,
  width,
  height,
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded";

  if (variant === "text") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              "h-4",
              i === lines - 1 ? "w-2/3" : "w-full"
            )}
            style={{ width: width }}
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-4 p-6", className)}>
        <div className={cn(baseClasses, "h-48 w-full")} />
        <div className={cn(baseClasses, "h-6 w-3/4")} />
        <div className="space-y-2">
          <div className={cn(baseClasses, "h-4 w-full")} />
          <div className={cn(baseClasses, "h-4 w-2/3")} />
        </div>
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div className={cn("flex items-center space-x-4", className)}>
        <div className={cn(baseClasses, "w-12 h-12 rounded-full")} />
        <div className="space-y-2">
          <div className={cn(baseClasses, "h-4 w-24")} />
          <div className={cn(baseClasses, "h-3 w-16")} />
        </div>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <div 
        className={cn(baseClasses, "h-10 w-24", className)}
        style={{ width: width, height: height }}
      />
    );
  }

  // Custom variant
  return (
    <div 
      className={cn(baseClasses, className)}
      style={{ width: width, height: height }}
    />
  );
}

// Page Loading Component
interface PageLoadingProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function PageLoading({ 
  title = "Loading...", 
  subtitle,
  className 
}: PageLoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[400px] space-y-4", className)}>
      <LoadingSpinner size="lg" variant="dots" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
