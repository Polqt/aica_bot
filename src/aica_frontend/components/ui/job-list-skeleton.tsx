import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface JobListSkeletonProps {
  count?: number;
  showDetails?: boolean;
}

export function JobListSkeleton({
  count = 5,
  showDetails = true,
}: JobListSkeletonProps) {
  return (
    <div className="grid lg:grid-cols-5 gap-8 h-[calc(100vh-300px)] min-h-[500px]">
      {/* Job Cards Skeleton */}
      <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-2">
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-4 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer">
              <CardContent className="p-0 space-y-3">
                {/* Title */}
                <Skeleton className="h-5 w-3/4" />

                {/* Company */}
                <Skeleton className="h-4 w-1/2" />

                {/* Tags */}
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Job Details Skeleton */}
      {showDetails && (
        <div className="lg:col-span-3 overflow-y-auto pr-2">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-6 border border-gray-200">
              <CardContent className="p-0 space-y-6">
                {/* Header */}
                <div className="space-y-3">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                </div>

                {/* Match Score (for job-matches) */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Requirements */}
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>

                {/* Action Button */}
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
