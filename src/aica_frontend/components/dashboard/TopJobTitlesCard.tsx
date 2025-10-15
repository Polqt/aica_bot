'use client';

import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface TopJobTitle {
  title: string;
  count: number;
  avgMatchScore: number;
}

interface TopJobTitlesCardProps {
  jobTitles: TopJobTitle[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export function TopJobTitlesCard({ jobTitles }: TopJobTitlesCardProps) {
  const chartData = jobTitles.map((job, index) => ({
    name: job.title,
    value: job.count,
    avgScore: job.avgMatchScore,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      name?: string;
      value?: number;
      payload: { avgScore: number };
    }>;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">Matches: {payload[0].value}</p>
          <p className="text-sm text-emerald-600">
            Avg Score: {(payload[0].payload.avgScore * 100).toFixed(0)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border border-gray-200 shadow-sm bg-white h-full">
        <CardHeader className="border-b border-gray-100 py-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-[18px] font-semibold text-gray-900">
              Top Job Positions
            </CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-600 mt-1">
            Most matched job titles
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {jobTitles.length > 0 ? (
            <div className="space-y-6">
              {/* Pie Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props) =>
                        typeof props.percent === 'number' && props.percent !== null
                          ? `${(props.percent * 100).toFixed(0)}%`
                          : ''
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with details */}
              <div className="space-y-2">
                {jobTitles.map((job, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {job.count} {job.count === 1 ? 'match' : 'matches'}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex-shrink-0">
                      {(job.avgMatchScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No job matches yet. Upload your resume to get started!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
