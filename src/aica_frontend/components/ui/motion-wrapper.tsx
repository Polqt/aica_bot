"use client";

import { motion, Variants } from "motion/react";
import { cn } from "@/lib/utils";

interface MotionWrapperProps {
  children: React.ReactNode;
  variant?: "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scale" | "stagger";
  delay?: number;
  duration?: number;
  className?: string;
  viewport?: { once?: boolean; amount?: number };
  style?: React.CSSProperties;
}

const motionVariants: Record<string, Variants> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  },
  slideLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  stagger: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
};

export function MotionWrapper({
  children,
  variant = "slideUp",
  delay = 0,
  duration = 0.6,
  className,
  viewport = { once: true },
  style,
}: MotionWrapperProps) {
  const variants = motionVariants[variant];

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      exit="exit"
      variants={variants}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      viewport={viewport}
      className={cn(className)}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Specialized wrapper for staggered children animations
interface StaggerWrapperProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  childVariant?: "fadeIn" | "slideUp" | "scale";
}

export function StaggerWrapper({
  children,
  className,
  staggerDelay = 0.1,
  childVariant = "slideUp",
}: StaggerWrapperProps) {
  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const childVariants = motionVariants[childVariant];

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      variants={containerVariants}
      viewport={{ once: true }}
      className={cn(className)}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={childVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
