'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AuthCarousel } from '@/components/ui/auth-carousel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  features,
  stats,
  team,
  appInfo,
  researchInfo,
  authContent,
} from '@/lib/constants/app-data';
import { GraduationCap, BookOpen } from 'lucide-react';

interface AuthCarouselWrapperProps {
  className?: string;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export function AuthCarouselWrapper({
  className,
  onCollapseChange,
}: AuthCarouselWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  const carouselItems = [
    {
      id: 'welcome',
      title: `Welcome to ${appInfo.name}`,
      description: appInfo.description,
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {authContent.badges.map((badge, idx) => {
              const IconComponent = badge.icon;
              return (
                <Badge key={idx} variant="secondary" className={badge.color}>
                  <IconComponent className="w-3 h-3 mr-1" />
                  {badge.text}
                </Badge>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: 'features',
      title: 'Powerful Features',
      description:
        'Experience cutting-edge technology that transforms how you find your dream job in the tech industry.',
      content: (
        <div className="space-y-3">
          {features.slice(0, 3).map((feature, idx) => {
            const IconComponent = feature.icon;
            const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500'];
            return (
              <div key={idx} className="flex items-center space-x-3">
                <div className={`${colors[idx]} p-2 rounded-lg`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {feature.description.substring(0, 50)}...
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      id: 'team',
      title: 'Meet Our Team',
      description: `Dedicated Computer Science students from ${appInfo.university} working together to revolutionize job matching.`,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {team.map((member, idx) => {
              const colors = [
                'from-blue-400 to-purple-500',
                'from-purple-400 to-pink-500',
                'from-green-400 to-blue-500',
                'from-pink-400 to-red-500',
              ];
              return (
                <div key={idx} className="text-center">
                  <div
                    className={`w-8 h-8 mx-auto mb-2 bg-gradient-to-br ${colors[idx]} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {member.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <p className="text-xs font-medium">
                    {member.name.split(' ')[0]} {member.name.split(' ')[1]}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {member.role}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: 'research',
      title: 'Research & Innovation',
      description: researchInfo.abstract,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-sm">Academic Excellence</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Supervised by expert faculty members and industry professionals
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-sm">Published Research</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {researchInfo.title}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'stats',
      title: authContent.carousel.stats.title,
      description: authContent.carousel.stats.description,
      content: (
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, idx) => {
            const colors = [
              {
                bg: 'from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800',
                border: 'border-blue-200 dark:border-blue-700',
                text: 'text-blue-600 dark:text-blue-400',
              },
              {
                bg: 'from-green-50 to-green-100 dark:from-green-900 dark:to-green-800',
                border: 'border-green-200 dark:border-green-700',
                text: 'text-green-600 dark:text-green-400',
              },
              {
                bg: 'from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800',
                border: 'border-purple-200 dark:border-purple-700',
                text: 'text-purple-600 dark:text-purple-400',
              },
              {
                bg: 'from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800',
                border: 'border-orange-200 dark:border-orange-700',
                text: 'text-orange-600 dark:text-orange-400',
              },
            ];
            const color = colors[idx];
            return (
              <Card
                key={idx}
                className={`p-3 bg-gradient-to-br ${color.bg} ${color.border}`}
              >
                <CardContent className="p-0 text-center">
                  <div className={`text-xl font-bold ${color.text}`}>
                    {stat.value}
                  </div>
                  <div
                    className={`text-xs ${color.text
                      .replace('600', '700')
                      .replace('400', '300')}`}
                  >
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <div className="relative h-full group">
      {/* Toggle Button - Outside the carousel container */}
      <motion.button
        onClick={handleToggleCollapse}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'absolute z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200 dark:border-slate-700',
          'top-4 left-4 opacity-0 group-hover:opacity-100',
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        )}
      </motion.button>

      <AuthCarousel
        items={carouselItems}
        autoSlideInterval={5000}
        className={className}
        isCollapsed={isCollapsed}
      />
    </div>
  );
}
