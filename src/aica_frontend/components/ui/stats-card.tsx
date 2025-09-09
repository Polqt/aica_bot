"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  value: string;
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  bgGradient?: string;
  className?: string;
  animationDelay?: number;
}

export function StatsCard({
  value,
  label,
  icon: Icon,
  iconColor = "text-blue-600 dark:text-blue-400",
  bgGradient = "from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700",
  className,
  animationDelay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: animationDelay }}
      className={cn("", className)}
    >
      <Card className={cn(
        "text-center p-6 border border-slate-200/50 dark:border-0 shadow-sm dark:shadow-none bg-gradient-to-r",
        bgGradient
      )}>
        <CardContent className="p-0">
          {Icon && (
            <Icon className={cn("w-8 h-8 mx-auto mb-3", iconColor)} />
          )}
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {value}
          </div>
          <div className="text-slate-600 dark:text-slate-300 text-sm">
            {label}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Preset variants for common use cases
export function AccuracyStatsCard({ animationDelay = 0 }: { animationDelay?: number }) {
  return (
    <StatsCard
      value="95%"
      label="Job Match Accuracy"
      animationDelay={animationDelay}
    />
  );
}

export function SpeedStatsCard({ animationDelay = 0 }: { animationDelay?: number }) {
  return (
    <StatsCard
      value="2x"
      label="Faster Job Discovery"
      bgGradient="from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700"
      iconColor="text-green-600 dark:text-green-400"
      animationDelay={animationDelay}
    />
  );
}

export function SuccessStatsCard({ animationDelay = 0 }: { animationDelay?: number }) {
  return (
    <StatsCard
      value="88%"
      label="Success Rate"
      bgGradient="from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700"
      iconColor="text-purple-600 dark:text-purple-400"
      animationDelay={animationDelay}
    />
  );
}
