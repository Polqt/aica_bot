'use client';

import React from 'react';
import { motion } from 'motion/react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils/processing';
import { MAX_FILE_SIZE_MB } from '@/lib/constants/upload';

interface FileUploaderProps {
  selectedFile: File | null;
  isUploading: boolean;
  error: string;
  onFileChange: (files: File[]) => void;
  onUpload: () => void;
  onSkip: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  selectedFile,
  isUploading,
  error,
  onFileChange,
  onUpload,
  onSkip,
}) => {
  return (
    <>
      <div className="space-y-4">
        <FileUpload onChange={onFileChange} />

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2 p-3 bg-red-50/50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          >
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
                  {formatFileSize(selectedFile.size)} MB
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onUpload}
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
          onClick={onSkip}
          disabled={isUploading}
          className="flex-1 btn-modern"
          size="lg"
        >
          Skip for Now
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Supported formats: PDF, DOC, DOCX (Max {MAX_FILE_SIZE_MB}MB)
        </p>
      </div>
    </>
  );
};

export default FileUploader;