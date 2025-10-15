'use client';

import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TopSkill {
  name: string;
  count: number;
  category: string;
}

interface TopSkillsChartProps {
  topSkills: TopSkill[];
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export function TopSkillsChart({ topSkills }: TopSkillsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100 py-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-[18px] font-semibold text-gray-900">
              Most In-Demand Skills
            </CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-600 mt-1">
            Your skills that appear most in job matches
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {topSkills.length > 0 ? (
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSkills}
                  margin={{ top: 10, right: 10, left: 10, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    label={{
                      value: 'Matches',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 12, fill: '#6b7280' },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                    formatter={(value: number) => [`${value} matches`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {topSkills.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-2">
                No skill data available yet
              </p>
              <p className="text-xs text-gray-400">
                Get job matches to see which of your skills are most in-demand
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
