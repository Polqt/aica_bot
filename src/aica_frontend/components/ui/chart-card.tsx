"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface ChartData {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

interface ChartCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  data: ChartData[];
  type?: "pie" | "donut" | "bar";
  className?: string;
  showLegend?: boolean;
  showPercentages?: boolean;
}

export function ChartCard({
  title,
  description,
  icon: Icon,
  data,
  type = "donut",
  className,
  showLegend = true,
  showPercentages = true,
}: ChartCardProps) {
  // Calculate total and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: Math.round((item.value / total) * 100),
  }));

  // Create SVG path for donut/pie chart
  const createPath = (item: ChartData, index: number): string => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    
    // Calculate cumulative angle for positioning
    const previousItems = dataWithPercentages.slice(0, index);
    const cumulativeAngle = previousItems.reduce((sum, prevItem) => 
      sum + ((prevItem.value / total) * 360), 0
    );
    
    const startAngle = cumulativeAngle - 90; // Start from top
    const endAngle = startAngle + angle;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const centerX = 120;
    const centerY = 120;
    const radius = type === "donut" ? 80 : 100;
    const innerRadius = type === "donut" ? 50 : 0;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    if (type === "donut") {
      const innerX1 = centerX + innerRadius * Math.cos(startAngleRad);
      const innerY1 = centerY + innerRadius * Math.sin(startAngleRad);
      const innerX2 = centerX + innerRadius * Math.cos(endAngleRad);
      const innerY2 = centerY + innerRadius * Math.sin(endAngleRad);
      
      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1} Z`;
    } else {
      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    }
  };

  return (
    <Card className={cn("glass-card-enhanced", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {Icon && <Icon className="w-5 h-5" />}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chart */}
        <div className="flex items-center justify-center">
          <motion.svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            className="drop-shadow-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {dataWithPercentages.map((item, index) => (
              <motion.path
                key={item.name}
                d={createPath(item, index)}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
            
            {/* Center text for donut chart */}
            {type === "donut" && (
              <text
                x="120"
                y="115"
                textAnchor="middle"
                className="fill-slate-700 dark:fill-slate-300 text-sm font-semibold"
              >
                Total
              </text>
            )}
            {type === "donut" && (
              <text
                x="120"
                y="135"
                textAnchor="middle"
                className="fill-slate-600 dark:fill-slate-400 text-xl font-bold"
              >
                {total.toLocaleString()}
              </text>
            )}
          </motion.svg>
        </div>

        {/* Legend */}
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-2"
          >
            {dataWithPercentages.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {item.value.toLocaleString()}
                  </span>
                  {showPercentages && (
                    <span className="text-slate-500 dark:text-slate-500 font-medium">
                      ({item.percentage}%)
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
