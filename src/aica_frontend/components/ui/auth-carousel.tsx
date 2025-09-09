"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { appInfo } from '@/lib/constants/app-data';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  content?: React.ReactNode;
  image?: string;
}

interface AuthCarouselProps {
  items: CarouselItem[];
  autoSlideInterval?: number;
  className?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AuthCarousel = ({
  items,
  autoSlideInterval = 5000,
  className,
  isCollapsed,
  onToggleCollapse,
}: AuthCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isCollapsed) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [items.length, autoSlideInterval, isCollapsed]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentItem = items[currentIndex];

  return (
    <motion.div
      animate={{
        width: isCollapsed ? "20px" : "100%",
        opacity: isCollapsed ? 0.3 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 35,
      }}
      className={cn(
        "relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-100 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200/40 dark:border-0 shadow-lg shadow-black/5 dark:shadow-none",
        isCollapsed && "bg-gradient-to-br from-blue-50/30 to-purple-100/30 dark:from-slate-800/30 dark:to-slate-900/30 border-slate-200/20 dark:border-slate-700/20",
        className
      )}
    >
      {/* Carousel Content */}
      <AnimatePresence mode="wait">
        {!isCollapsed && currentItem && (
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col justify-center p-8 overflow-hidden"
          >
            {/* Content */}
            <div className="space-y-6 max-h-full overflow-y-auto">
              {currentItem.image && (
                <div className="relative w-full h-48 mb-6 flex-shrink-0">
                  <img
                    src={currentItem.image}
                    alt={currentItem.title}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}
              
              <div className="space-y-4 flex-shrink-0">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {currentItem.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentItem.description}
                </p>
                
                {currentItem.content && (
                  <div className="mt-6">
                    {currentItem.content}
                  </div>
                )}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-200",
                    index === currentIndex
                      ? "bg-blue-500 w-6"
                      : "bg-slate-400 hover:bg-slate-500"
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed State Content */}
      {isCollapsed && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {/* Remove the AICA text when collapsed */}
        </div>
      )}
    </motion.div>
  );
};
