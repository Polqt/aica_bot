'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
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
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  selectedFile,
  isUploading,
  error,
  onFileChange,
  onUpload,
}) => {
  return (
    <>
      <div className="space-y-4">
        <FileUpload onChange={onFileChange} />

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        {selectedFile && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-800">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
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
          className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all"
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
      </div>

      <div className="text-center pt-2">
        <p className="text-sm text-gray-500">
          Supported formats: PDF, DOC, DOCX (Max {MAX_FILE_SIZE_MB}MB)
        </p>
      </div>
    </>
  );
};

export default FileUploader;
