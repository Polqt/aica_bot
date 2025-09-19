import { CheckCircle2, Star, AlertCircle } from 'lucide-react';

export const getConfidenceColor = (confidence: string) => {
  const conf = confidence.toLowerCase();
  switch (conf) {
    case 'high':
      return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
    case 'low':
      return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
  }
};

export const getConfidenceIcon = (confidence: string) => {
  const conf = confidence.toLowerCase();
  switch (conf) {
    case 'high':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'medium':
      return <Star className="w-4 h-4" />;
    case 'low':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

export const getMatchScoreColor = (score: number) => {
  if (score >= 0.8) return 'text-green-600 dark:text-green-400';
  if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};
