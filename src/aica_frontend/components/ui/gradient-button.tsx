"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import * as React from "react";

interface GradientButtonProps extends Omit<React.ComponentProps<"button">, "variant"> {
  gradient?: "primary" | "secondary" | "success" | "warning" | "danger";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  animateOnHover?: boolean;
  fullWidth?: boolean;
}

const gradientVariants = {
  primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
  secondary: "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800",
  success: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
  warning: "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700",
  danger: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
};

export function GradientButton({
  children,
  gradient = "primary",
  icon: Icon,
  iconPosition = "left",
  animateOnHover = true,
  fullWidth = false,
  className,
  ...props
}: GradientButtonProps) {
  const buttonContent = (
    <>
      {Icon && iconPosition === "left" && <Icon className="w-4 h-4 mr-2" />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="w-4 h-4 ml-2" />}
    </>
  );

  const buttonElement = (
    <Button
      className={cn(
        "btn-modern text-white border-0 shadow-lg",
        gradientVariants[gradient],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {buttonContent}
    </Button>
  );

  if (animateOnHover) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={fullWidth ? "w-full" : "inline-block"}
      >
        {buttonElement}
      </motion.div>
    );
  }

  return buttonElement;
}

// Specialized variant for subtle gradient buttons (like in Paper component)
interface SubtleGradientButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  className?: string;
  onClick?: () => void;
}

export function SubtleGradientButton({
  children,
  icon: Icon,
  iconPosition = "left",
  className,
  onClick,
}: SubtleGradientButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-block"
    >
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200/80 dark:border-blue-800/50 transition-all duration-200 shadow-sm hover:shadow-md hover:border-blue-300/80 dark:hover:border-blue-700/60",
          className
        )}
      >
        {Icon && iconPosition === "left" && <Icon className="h-4 w-4 mr-2" />}
        {children}
        {Icon && iconPosition === "right" && <Icon className="h-4 w-4 ml-2" />}
      </button>
    </motion.div>
  );
}
