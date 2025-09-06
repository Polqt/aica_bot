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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type ProcessingStatus =
  | 'not_uploaded'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'not_found';

interface StatusResponse {
  status: ProcessingStatus;
  message?: string;
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
    return () => {
      isComponentMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Handle polling logic
  useEffect(() => {
    if (processingStatus === 'processing' && pollCount < MAX_POLLS) {
      pollIntervalRef.current = setInterval(() => {
        if (isComponentMountedRef.current) {
          checkProcessingStatus();
          setPollCount(prev => prev + 1);
        }
      }, POLL_INTERVAL_MS);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }

    // Stop polling and handle timeout
    if (pollCount >= MAX_POLLS && processingStatus === 'processing') {
      setProcessingStatus('failed');
      toast.error('Processing timeout. Please try uploading again.');
    }
  }, [processingStatus, pollCount]);

  const getAuthToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in first.');
      router.push('/login');
      return null;
    }
    return token;
  }, [router]);

  const checkProcessingStatus = useCallback(async (): Promise<void> => {
    const token = getAuthToken();
    if (!token || !isComponentMountedRef.current) return;

    try {
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

      if (!isComponentMountedRef.current) return;

      setProcessingStatus(data.status);

      if (data.status === 'completed') {
        toast.success('Resume processed successfully!');
        setTimeout(() => {
          if (isComponentMountedRef.current) {
            router.push('/dashboard');
          }
        }, 1500);
      } else if (data.status === 'failed') {
        toast.error('Resume processing failed. Please try again.');
      }
    } catch (error) {
      console.error('Error checking processing status:', error);
      if (isComponentMountedRef.current) {
        setProcessingStatus('failed');
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

      const response = await fetch(`${API_BASE_URL}/auth/upload-resume`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorData = responseData as ApiError;
        throw new Error(
          errorData.detail || errorData.message || 'Upload failed',
        );
      }

      if (!isComponentMountedRef.current) return;

      toast.success('Resume uploaded successfully! Processing...');
      setProcessingStatus('processing');
      setPollCount(0);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed.';
      console.error('Upload error:', error);

      if (isComponentMountedRef.current) {
        toast.error(errorMessage);
        setError(errorMessage);
        setProcessingStatus('failed');
      }
    } finally {
      if (isComponentMountedRef.current) {
        setIsUploading(false);
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

  const getStatusIcon = () => {
    switch (processingStatus) {
      case 'processing':
        return (
          <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
        );
      case 'completed':
        return (
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        );
      case 'failed':
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
      case 'completed':
        return {
          title: 'Upload Complete!',
          description:
            'Your resume has been uploaded and processed successfully!',
          showProgress: false,
        };
      case 'failed':
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

                {processingStatus === 'failed' && (
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
