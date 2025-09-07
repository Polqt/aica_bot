'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Download, FileText, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { paperData } from '@/lib/constants/app-data';

export default function Paper() {
  const [showPDF, setShowPDF] = useState(false);

  return (
    <div>
      <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {paperData.title}
          </CardTitle>
          <div className="text-lg text-slate-600 dark:text-slate-300 mb-4">
            {paperData.authors.join(', ')}
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {paperData.publicationDate}
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {paperData.conference}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <motion.button
              onClick={() => setShowPDF(!showPDF)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800/30 transition-all duration-200"
            >
              <FileText className="h-4 w-4 mr-2" />
              {showPDF ? 'Hide PDF' : 'View PDF'}
            </motion.button>
            <motion.a
              href="/aica-research-paper.pdf"
              download="AICA-Research-Paper.pdf"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800/30 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </motion.a>
          </div>
        </CardContent>
      </Card>

      {showPDF && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto mb-12"
        >
          <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                PDF Viewer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full" style={{ height: '800px' }}>
                <iframe
                  src="/aica-research-paper.pdf"
                  className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-700"
                  title="AICA Research Paper"
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 text-center">
                Use the controls above to navigate through the document
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
