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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
          <p className="font-semibold text-gray-900 text-sm mb-1">
            {payload[0].name}
          </p>
          <p className="text-xs text-gray-600">
            {payload[0].value} {payload[0].value === 1 ? 'match' : 'matches'}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">
            Avg: {(payload[0].payload.avgScore * 100).toFixed(0)}%
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
      <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
        <CardHeader className="border-b border-gray-100 py-4 px-6 bg-gradient-to-r from-blue-50/30 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-[17px] font-semibold text-gray-900">
                Top Job Positions
              </CardTitle>
              <CardDescription className="text-xs text-gray-600 mt-0.5">
                Most matched job titles
              </CardDescription>
            </div>
            {jobTitles.length > 0 && (
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                Top {jobTitles.length}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {jobTitles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-[280px] h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {COLORS.map((color, index) => (
                          <linearGradient
                            key={`gradient-${index}`}
                            id={`pieGradient${index}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={color}
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor={color}
                              stopOpacity={0.7}
                            />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={props =>
                          typeof props.percent === 'number' &&
                          props.percent !== null
                            ? `${(props.percent * 100).toFixed(0)}%`
                            : ''
                        }
                        outerRadius={95}
                        innerRadius={0}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#pieGradient${index % COLORS.length})`}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend with details */}
              <div className="flex flex-col justify-center space-y-2.5">
                {jobTitles.map((job, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-transparent rounded-lg hover:from-gray-100 hover:to-gray-50 transition-all duration-200 group cursor-pointer border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm ring-2 ring-white"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {job.count} {job.count === 1 ? 'match' : 'matches'}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex-shrink-0 text-xs font-semibold">
                      {(job.avgMatchScore * 100).toFixed(0)}%
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50"></div>
                <Briefcase className="w-14 h-14 text-blue-400 relative" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                No job matches yet
              </p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Upload your resume to get started!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
