import { CheckCircle2, Star, AlertCircle } from 'lucide-react';

export const getConfidenceColor = (confidence: string) => {
  switch (confidence) {
    case 'high':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getConfidenceIcon = (confidence: string) => {
  switch (confidence) {
    case 'high':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'medium':
      return <Star className="w-4 h-4" />;
    case 'low':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

export const getMatchScoreColor = (score: number) => {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
};
