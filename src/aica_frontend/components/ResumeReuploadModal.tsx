'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  Upload,
  Briefcase,
  GraduationCap,
  Code,
  Target,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ResumeReuploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeReuploadModal({
  isOpen,
  onClose,
}: ResumeReuploadModalProps) {
  const router = useRouter();

  const handleProceedToUpload = () => {
    router.push('/upload?mode=replace');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <Card className="border border-gray-200 shadow-2xl">
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-red-50 to-orange-50 border-b border-red-100 p-6">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Re-upload Your Resume
                      </h2>
                      <p className="text-sm text-gray-600">
                        This will replace all existing profile data
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-900">
                          Important: This action will replace all your data
                        </p>
                        <p className="text-xs text-red-700 leading-relaxed">
                          Re-uploading a resume will clear all existing
                          information and re-parse everything from your new
                          resume. This ensures the AI has clean, consistent data
                          to work with.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* What Will Be Replaced */}
                  <div className="bg-white border-2 border-red-200 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-100">
                        <Upload className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          What Will Be Replaced:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Code className="w-4 h-4 text-red-500" />
                            <span>All existing skills will be deleted</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Briefcase className="w-4 h-4 text-red-500" />
                            <span>
                              All work experience entries will be removed
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <GraduationCap className="w-4 h-4 text-red-500" />
                            <span>All education records will be cleared</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Target className="w-4 h-4 text-red-500" />
                            <span>All job matches will be regenerated</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={onClose}
                      className="flex-1 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleProceedToUpload}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
                    >
                      Replace & Upload New Resume
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
