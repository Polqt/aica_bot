'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Download, FileText, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { paperData } from '@/lib/constants/app-data';
import { SubtleGradientButton } from '@/components/ui/gradient-button';
import { MotionWrapper } from '@/components/ui/motion-wrapper';

export default function Paper() {
  const [showPDF, setShowPDF] = useState(false);

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <MotionWrapper variant="fadeIn" className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
          Our Research Paper
        </h1>
      </MotionWrapper>

      <MotionWrapper variant="fadeIn" delay={0.2} className="max-w-5xl mx-auto">
        <Card className="border border-slate-200/50 dark:border-0 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl shadow-black/5 dark:shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
              {paperData.title}
            </CardTitle>
            <div className="text-base text-slate-600 dark:text-slate-300 mb-3">
              {paperData.authors.join(', ')}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
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
          <CardContent className="pt-2">
            <div className="flex gap-3">
              <SubtleGradientButton
                onClick={() => setShowPDF(!showPDF)}
                icon={FileText}
                iconPosition="left"
              >
                {showPDF ? 'Hide PDF' : 'View PDF'}
              </SubtleGradientButton>
              <a
                href="/aica-research-paper.pdf"
                download="AICA-Research-Paper.pdf"
              >
                <SubtleGradientButton
                  icon={Download}
                  iconPosition="left"
                >
                  Download PDF
                </SubtleGradientButton>
              </a>
            </div>
          </CardContent>
        </Card>
      </MotionWrapper>

      {showPDF && (
        <MotionWrapper variant="fadeIn" delay={0.1} className="max-w-5xl mx-auto">
          <Card className="border border-slate-200/50 dark:border-0 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl shadow-black/5 dark:shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                PDF Viewer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full" style={{ height: '700px' }}>
                <iframe
                  src="/aica-research-paper.pdf"
                  className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-700"
                  title="AICA Research Paper"
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 text-center">
                Use the controls above to navigate through the document
              </p>
            </CardContent>
          </Card>
        </MotionWrapper>
      )}
    </div>
  );
}