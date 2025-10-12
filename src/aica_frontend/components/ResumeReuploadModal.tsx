'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  Upload,
  FileText,
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
  const [selectedOption, setSelectedOption] = useState<
    'replace' | 'merge' | null
  >(null);

  const handleReplaceEverything = () => {
    // Navigate to upload page with replace flag
    router.push('/upload?mode=replace');
  };

  const handleKeepAndMerge = () => {
    // Navigate to upload page with merge flag
    router.push('/upload?mode=merge');
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
                {/* Header */}
                <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-100 p-6">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Re-upload Your Resume
                      </h2>
                      <p className="text-sm text-gray-600">
                        Choose how you want to handle your existing profile data
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Warning Box */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-amber-900">
                          Important: This will affect your profile data
                        </p>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          Re-uploading a resume will re-parse your information
                          and regenerate job matches. You can choose to replace
                          all existing data or merge with your current profile.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {/* Replace Option */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedOption('replace')}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedOption === 'replace'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            selectedOption === 'replace'
                              ? 'bg-red-100'
                              : 'bg-gray-100'
                          }`}
                        >
                          <Upload
                            className={`w-5 h-5 ${
                              selectedOption === 'replace'
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Replace Everything
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Start fresh with a clean slate. This will:
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Code className="w-3.5 h-3.5" />
                              <span>Delete all existing skills</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Briefcase className="w-3.5 h-3.5" />
                              <span>Remove all work experience entries</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>Clear all education records</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Target className="w-3.5 h-3.5" />
                              <span>Clear all job matches</span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedOption === 'replace'
                              ? 'border-red-500 bg-red-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedOption === 'replace' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </motion.button>

                    {/* Merge Option */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedOption('merge')}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedOption === 'merge'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            selectedOption === 'merge'
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}
                        >
                          <FileText
                            className={`w-5 h-5 ${
                              selectedOption === 'merge'
                                ? 'text-blue-600'
                                : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Keep & Merge
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Keep your manual edits and merge with new resume
                            data:
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Code className="w-3.5 h-3.5" />
                              <span>Add new skills (keep existing)</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Briefcase className="w-3.5 h-3.5" />
                              <span>
                                Merge experience (keep manual entries)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>Merge education (avoid duplicates)</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Target className="w-3.5 h-3.5" />
                              <span>Regenerate job matches</span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedOption === 'merge'
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedOption === 'merge' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={onClose}
                      className="flex-1 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={
                        selectedOption === 'replace'
                          ? handleReplaceEverything
                          : handleKeepAndMerge
                      }
                      disabled={!selectedOption}
                      className={`flex-1 ${
                        selectedOption === 'replace'
                          ? 'bg-red-600 hover:bg-red-700 text-white border-0'
                          : selectedOption === 'merge'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-0'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed border-0'
                      }`}
                    >
                      {selectedOption === 'replace'
                        ? 'Replace & Upload'
                        : selectedOption === 'merge'
                        ? 'Merge & Upload'
                        : 'Select an Option'}
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
