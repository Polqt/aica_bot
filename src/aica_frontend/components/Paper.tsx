'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Calendar,
  Download,
  FileText,
  Users,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion } from 'motion/react';

const paperData = {
  title:
    'AI Career Assistant: Bridging the Gap Between Technology Education and Industry Demands Through Intelligent Job Matching',
  authors: [
    'April Gamboa',
    'Janpol Hidalgo',
    'Heidine Mahandog',
    'Nathania Santia',
  ],
  publicationDate: 'March 2024',
  conference: 'University of Saint La Salle - College of Computing Studies',
  abstract:
    'A comprehensive study on implementing Large Language Models and Retrieval-Augmented Generation for career matching in the technology sector.',
};

export default function Paper() {
  const [showPDF, setShowPDF] = useState(false);

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-12">
            <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide">
                  Research Paper
                </span>
              </div>

              <CardTitle className="text-3xl lg:text-5xl font-bold leading-tight mb-8">
                {paperData.title}
              </CardTitle>

              <div className="space-y-6">
                <div className="bg-white/20 rounded-xl p-6">
                  <p className="text-violet-100 font-semibold text-lg mb-2">
                    Authors:
                  </p>
                  <p className="text-white font-semibold text-xl">
                    {paperData.authors.join(' • ')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 bg-white/20 rounded-lg px-6 py-3">
                    <Calendar className="h-5 w-5 text-yellow-300" />
                    <span className="text-white font-semibold">
                      {paperData.publicationDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/20 rounded-lg px-6 py-3">
                    <Users className="h-5 w-5 text-green-300" />
                    <span className="text-white font-semibold text-sm">
                      {paperData.conference}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-12">
              <div className="space-y-8">
                <div className="bg-gray-50 rounded-xl p-8">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    Abstract
                  </h4>
                  <p className="text-gray-700 font-medium leading-relaxed text-lg">
                    {paperData.abstract}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <motion.button
                    onClick={() => setShowPDF(!showPDF)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center justify-center gap-3 px-10 py-4 bg-white border-2 border-violet-300 text-violet-600 hover:bg-violet-600 hover:text-white rounded-xl font-semibold text-lg uppercase tracking-wide transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {showPDF ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                    {showPDF ? 'Hide PDF' : 'View PDF'}
                  </motion.button>

                  <motion.a
                    href="/aica-research-paper.pdf"
                    download="AICA-Research-Paper.pdf"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Download className="h-5 w-5" />
                    Download PDF
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </motion.a>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {showPDF && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-8 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 uppercase tracking-wide">
                        PDF Viewer
                      </h3>
                      <p className="text-gray-600 font-medium">
                        Interactive document viewer
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setShowPDF(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-colors duration-300"
                  >
                    <EyeOff className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="relative">
                <div
                  className="w-full bg-gray-100 dark:bg-gray-800"
                  style={{ height: '800px' }}
                >
                  <iframe
                    src="/aica-research-paper.pdf"
                    className="w-full h-full"
                    title="AICA Research Paper"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
