'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  bgColor: string;
  iconColor: string;
  subtitle?: string;
  delay?: number;
}

export function StatsCard({
  icon: Icon,
  title,
  value,
  bgColor,
  iconColor,
  subtitle,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm text-gray-600 font-medium">{title}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-xl ${bgColor}`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
