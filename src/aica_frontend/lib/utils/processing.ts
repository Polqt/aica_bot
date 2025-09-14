import { ProcessingStatus } from '@/hooks/useResumeProcessing';

export interface StatusContent {
  title: string;
  description: string;
  showProgress: boolean;
}

export const getStatusContent = (status: ProcessingStatus): StatusContent => {
  switch (status) {
    case 'processing':
      return {
        title: 'Processing Resume...',
        description: "We're analyzing your resume and extracting skills...",
        showProgress: true,
      };
    case 'parsing':
      return {
        title: 'Extracting Skills...',
        description: "We're reading your resume and identifying your skills...",
        showProgress: true,
      };
    case 'matching':
      return {
        title: 'Finding Job Matches...',
        description:
          "We're searching for relevant jobs based on your skills...",
        showProgress: true,
      };
    case 'finalizing':
      return {
        title: 'Finalizing Results...',
        description: "We're preparing your personalized job matches...",
        showProgress: true,
      };
    case 'completed':
      return {
        title: 'Upload Complete!',
        description:
          'Your resume has been uploaded and processed successfully!',
        showProgress: false,
      };
    case 'error':
      return {
        title: 'Processing Failed',
        description: 'Something went wrong. Please try uploading again.',
        showProgress: false,
      };
    default:
      return { title: '', description: '', showProgress: false };
  }
};

export const formatFileSize = (bytes: number): string => {
  return (bytes / (1024 * 1024)).toFixed(2);
};
