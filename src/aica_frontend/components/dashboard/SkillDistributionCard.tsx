'use client';

import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Code } from 'lucide-react';

interface SkillCategoryData {
  category: string;
  count: number;
  color: string;
}

interface SkillDistributionCardProps {
  skillData: SkillCategoryData[];
}

export function SkillDistributionCard({
  skillData,
}: SkillDistributionCardProps) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
  const hasData =
    skillData.length > 0 && skillData.some(item => item.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <Card className="border border-gray-200 shadow-sm bg-white h-full">
        <CardHeader className="border-b border-gray-100 py-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-[18px] font-semibold text-gray-900">
              Skill Categories
            </CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-600 mt-1">
            Distribution of your skills
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {hasData ? (
            <div className="space-y-4">
              {skillData.map((item, index) => {
                const total = skillData.reduce((sum, d) => sum + d.count, 0);
                const percentage = total > 0 ? (item.count / total) * 100 : 0;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium text-gray-900">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{item.count}</span>
                        <span className="text-gray-500 text-xs">
                          ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Code className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Add skills to see distribution
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
