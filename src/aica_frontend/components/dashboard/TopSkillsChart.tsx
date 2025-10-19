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

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload: { name: string; count: number; category: string };
  }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <p className="font-semibold text-gray-900 text-sm mb-1">
          {payload[0].payload.name}
        </p>
        <p className="text-xs text-emerald-600 font-medium">
          {payload[0].value} matches
        </p>
        <p className="text-xs text-gray-500 mt-0.5 capitalize">
          {payload[0].payload.category} skill
        </p>
      </div>
    );
  }
  return null;
};

export function TopSkillsChart({ topSkills }: TopSkillsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100 py-4 px-6 bg-gradient-to-r from-emerald-50/30 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-[17px] font-semibold text-gray-900">
                Most In-Demand Skills
              </CardTitle>
              <CardDescription className="text-xs text-gray-600 mt-0.5">
                Your top skills in job matches
              </CardDescription>
            </div>
            {topSkills.length > 0 && (
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Top {topSkills.length}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {topSkills.length > 0 ? (
            <div className="space-y-4">
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topSkills}
                    margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                  >
                    <defs>
                      {COLORS.map((color, index) => (
                        <linearGradient
                          key={`gradient-${index}`}
                          id={`colorGradient${index}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={color}
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="100%"
                            stopColor={color}
                            stopOpacity={0.6}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="name"
                      angle={-35}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                      label={{
                        value: 'Matches',
                        angle: -90,
                        position: 'insideLeft',
                        style: {
                          fontSize: 12,
                          fill: '#6b7280',
                          fontWeight: 600,
                        },
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={70}>
                      {topSkills.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#colorGradient${index % COLORS.length})`}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>


              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2">
                {topSkills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {skill.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {skill.count} {skill.count === 1 ? 'match' : 'matches'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-50"></div>
                <TrendingUp className="w-14 h-14 text-emerald-400 relative" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                No skill data available yet
              </p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Get job matches to see which of your skills are most in-demand
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
