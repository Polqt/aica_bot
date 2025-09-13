'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Upload,
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const MAX_FILE_SIZE_MB = 10;
const MAX_POLLS = 30;
const POLL_INTERVAL_MS = 2000;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

type ProcessingStatus =
  | 'not_uploaded'
  | 'processing'
  | 'parsing'
  | 'matching'
  | 'finalizing'
  | 'completed'
  | 'error'
  | 'not_found';

interface StatusResponse {
  status: ProcessingStatus;
  message?: string;
  step?: string;
  matches_found?: number;
}

interface ApiError {
  detail?: string;
  message?: string;
}

export default function ResumeUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatus, setProcessingStatus] =
    useState<ProcessingStatus>('not_uploaded');
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState<string>('');

  const router = useRouter();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    console.log('🏗️ Component mounted');
    isComponentMountedRef.current = true;

    return () => {
      console.log('🗑️ Component unmounting');
      isComponentMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const getAuthToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in first to upload your resume.');
      // Add a small delay to show the toast before redirecting
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return null;
    }
    return token;
  }, [router]);

  const checkProcessingStatus = useCallback(async (): Promise<void> => {
    const token = getAuthToken();
    if (!token || !isComponentMountedRef.current) return;

    try {
      console.log('🔍 Checking processing status...');
      const response = await fetch(`${API_BASE_URL}/auth/processing-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: StatusResponse = await response.json();
      console.log('📊 Status response:', data);

      if (!isComponentMountedRef.current) return;

      // Update status based on step information from backend
      const newStatus = data.step || data.status;

      // Type-safe status setting
      const validStatuses: ProcessingStatus[] = [
        'not_uploaded',
        'processing',
        'parsing',
        'matching',
        'finalizing',
        'completed',
        'error',
        'not_found',
      ];

      if (validStatuses.includes(newStatus as ProcessingStatus)) {
        console.log(`📝 Setting status to: ${newStatus}`);
        setProcessingStatus(newStatus as ProcessingStatus);
      } else {
        console.log(
          `⚠️ Invalid status received: ${newStatus}, defaulting to processing`,
        );
        setProcessingStatus('processing');
      }

      if (data.status === 'completed') {
        const matchCount = data.matches_found || 0;
        console.log(`✅ Processing completed! Found ${matchCount} matches`);

        // Stop polling
        if (pollIntervalRef.current) {
          console.log('🛑 Stopping polling - processing completed');
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        toast.success(
          `Resume processed successfully! Found ${matchCount} job matches.`,
        );
        setTimeout(() => {
          if (isComponentMountedRef.current) {
            console.log('🚀 Redirecting to job matches...');
            router.push('/job-matches');
          }
        }, 1500);
      } else if (data.status === 'error') {
        console.log('❌ Processing error:', data.message);

        // Stop polling
        if (pollIntervalRef.current) {
          console.log('🛑 Stopping polling - processing error');
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        toast.error(
          data.message || 'Resume processing failed. Please try again.',
        );
      }
    } catch (error) {
      console.error('Error checking processing status:', error);
      if (isComponentMountedRef.current) {
        setProcessingStatus('error');
        toast.error('Failed to check processing status.');
      }
    }
  }, [getAuthToken, router]);

  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a PDF, DOC, or DOCX file.';
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
    }

    return null;
  }, []);

  const handleFileChange = useCallback(
    (files: File[]): void => {
      if (!files.length) return;

      const file = files[0];
      const validationError = validateFile(file);

      if (validationError) {
        toast.error(validationError);
        setError(validationError);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError('');
      toast.success('File selected successfully!');
    },
    [validateFile],
  );

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      toast.error('Please select a file first.');
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('🚀 Uploading to:', `${API_BASE_URL}/auth/upload-resume`);
      console.log('📋 Upload details:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
      });

      const response = await fetch(`${API_BASE_URL}/auth/upload-resume`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📨 Upload response status:', response.status);
      console.log('📨 Upload response ok:', response.ok);

      const responseData = await response.json();
      console.log('📋 Upload response data:', responseData);
      console.log('🔍 Component mounted check:', isComponentMountedRef.current);
      console.log('🔍 Response ok check about to run...');
      console.log('🔍 Response.ok value:', response.ok, typeof response.ok);

      if (!response.ok) {
        console.log('❌ Response not ok, entering error handling...');
        const errorData = responseData as ApiError;
        const errorMessage =
          errorData.detail || errorData.message || 'Upload failed';

        // Provide more specific error messages for common issues
        if (response.status === 401) {
          throw new Error('Authentication expired. Please log in again.');
        } else if (response.status === 413) {
          throw new Error(
            'File too large. Please use a file smaller than 10MB.',
          );
        } else if (response.status === 400) {
          throw new Error(errorMessage);
        } else {
          throw new Error(`Upload failed: ${errorMessage}`);
        }
      }

      try {
        toast.success('Resume uploaded successfully! Processing...');

        const startPolling = () => {
          let currentPollCount = 0;

          const pollInterval = setInterval(async () => {
            if (currentPollCount >= MAX_POLLS) {
              clearInterval(pollInterval);
              return;
            }

            await checkProcessingStatus();
            currentPollCount++;
            setPollCount(currentPollCount);
          }, POLL_INTERVAL_MS);

          pollIntervalRef.current = pollInterval;
        };

        setIsUploading(false); // Upload is complete
        setError(''); // Clear any previous errors
        setPollCount(0); // Reset poll count

        // Small delay to ensure upload state is updated before setting processing
        setTimeout(() => {
          setProcessingStatus('processing');

          // Small delay to ensure processing state is updated
          setTimeout(() => {
            console.log('⏰ Starting first status check...');
            checkProcessingStatus();
            startPolling();
          }, 500);
        }, 100);
      } catch (successError) {
        console.error('❌ Error in success handling:', successError);
        throw successError;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed.';
      console.error('❌ Upload error:', error);
      console.error('❌ Error details:', {
        message: errorMessage,
        apiUrl: `${API_BASE_URL}/auth/upload-resume`,
        hasToken: !!token,
      });

      if (isComponentMountedRef.current) {
        // Handle specific error cases
        if (errorMessage.includes('Authentication expired')) {
          toast.error('Your session has expired. Redirecting to login...');
          setTimeout(() => {
            localStorage.removeItem('access_token');
            router.push('/login');
          }, 2000);
        } else {
          toast.error(errorMessage);
        }

        setError(errorMessage);
        setProcessingStatus('error');
        setIsUploading(false); // Also set here for error cases
      }
    }
  };

  const handleSkip = (): void => {
    router.push('/dashboard');
  };

  const handleRetry = (): void => {
    setProcessingStatus('not_uploaded');
    setPollCount(0);
    setError('');
    setSelectedFile(null);
  };

  // Handle cleanup and timeout logic
  useEffect(() => {
    // Handle timeout case
    if (
      pollCount >= MAX_POLLS &&
      processingStatus !== 'completed' &&
      processingStatus !== 'error'
    ) {
      console.log('⏰ Polling timeout reached');
      setProcessingStatus('error');
      toast.error('Processing timeout. Please try uploading again.');
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [pollCount, processingStatus]);

  const getStatusIcon = () => {
    switch (processingStatus) {
      case 'processing':
      case 'parsing':
      case 'matching':
      case 'finalizing':
        return (
          <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
        );
      case 'completed':
        return (
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        );
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusContent = () => {
    switch (processingStatus) {
      case 'processing':
        return {
          title: 'Processing Resume...',
          description: "We're analyzing your resume and extracting skills...",
          showProgress: true,
        };
      case 'parsing':
        return {
          title: 'Extracting Skills...',
          description:
            "We're reading your resume and identifying your skills...",
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

  const statusContent = getStatusContent();

  // Debug logging for render state
  console.log('🎨 Render state check:', {
    isUploading,
    processingStatus,
    pollCount,
    hasSelectedFile: !!selectedFile,
    error,
  });

  // Expose debug function for manual testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugUpload = () => {
        console.log('🔧 Manual state transition test...');
        setIsUploading(false);
        setProcessingStatus('processing');
      };
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass-card border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Resume Upload</CardTitle>
            <CardDescription className="text-lg">
              Upload your resume to get personalized job matches and insights
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {processingStatus === 'not_uploaded' && (
              <>
                <div className="space-y-4">
                  <FileUpload onChange={handleFileChange} />

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center space-x-2 p-3 bg-red-50/50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    </motion.div>
                  )}

                  {selectedFile && !error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-4 bg-green-50/50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading || !!error}
                    className="flex-1 btn-modern group bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Resume
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    disabled={isUploading}
                    className="flex-1 btn-modern"
                    size="lg"
                  >
                    Skip for Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}

            {processingStatus !== 'not_uploaded' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  {getStatusIcon()}
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    {statusContent.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {statusContent.description}
                  </p>

                  {statusContent.showProgress && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Attempt {pollCount + 1} of {MAX_POLLS}
                    </p>
                  )}
                </div>

                {processingStatus === 'error' && (
                  <Button onClick={handleRetry} className="btn-modern">
                    Try Again
                  </Button>
                )}
              </motion.div>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, DOC, DOCX (Max {MAX_FILE_SIZE_MB}MB)
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
