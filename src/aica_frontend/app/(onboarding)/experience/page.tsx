'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, Briefcase, Plus, Edit, Trash2, Calendar, Building } from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { UserExperience, UserExperienceCreate } from '@/types/user';

export default function ExperiencePage() {
  const router = useRouter();
  const { experience, addExperience, updateExperience, deleteExperience, loadResumeData, loading, saving } = useResumeBuilder();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<UserExperience | null>(null);
  const [formData, setFormData] = useState<UserExperienceCreate>({
    company_name: '',
    job_title: '',
    employment_type: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
  });

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  const resetForm = () => {
    setFormData({
      company_name: '',
      job_title: '',
      employment_type: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
    });
    setEditingExperience(null);
  };

  const handleOpenDialog = (exp?: UserExperience) => {
    if (exp) {
      setEditingExperience(exp);
      setFormData({
        company_name: exp.company_name,
        job_title: exp.job_title,
        employment_type: exp.employment_type,
        start_date: exp.start_date,
        end_date: exp.end_date || '',
        is_current: exp.is_current,
        description: exp.description || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleInputChange = (field: keyof UserExperienceCreate, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingExperience) {
        await updateExperience(editingExperience.id, formData);
      } else {
        await addExperience(formData);
      }
      handleCloseDialog();
    } catch  {
      // Error is handled in the hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this work experience?')) {
      await deleteExperience(id);
    }
  };

  const handleContinue = () => {
    router.push('/skills');
  };

  const handleBack = () => {
    router.push('/education');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Work Experience
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Share your professional journey and accomplishments
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Experience List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Your Experience
                </h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleOpenDialog()}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                      disabled={saving}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Experience
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
                    <DialogHeader>
                      <DialogTitle>
                        {editingExperience ? 'Edit Experience' : 'Add Work Experience'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingExperience ? 'Update your work experience details' : 'Add your professional experience'}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company_name">Company Name *</Label>
                          <Input
                            id="company_name"
                            type="text"
                            placeholder="Tech Corp Inc."
                            value={formData.company_name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('company_name', e.target.value)}
                            required
                            className="bg-white/50 dark:bg-slate-700/50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="job_title">Job Title *</Label>
                          <Input
                            id="job_title"
                            type="text"
                            placeholder="Software Engineer"
                            value={formData.job_title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('job_title', e.target.value)}
                            required
                            className="bg-white/50 dark:bg-slate-700/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employment_type">Employment Type *</Label>
                        <select
                          id="employment_type"
                          value={formData.employment_type}
                          onChange={(e) => handleInputChange('employment_type', e.target.value)}
                          required
                          className="w-full h-10 px-3 py-2 bg-white/50 dark:bg-slate-700/50 border-2 border-border rounded-base text-sm font-base text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black"
                        >
                          <option value="">Select employment type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Internship">Internship</option>
                          <option value="Apprenticeship">Apprenticeship</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start_date">Start Date *</Label>
                          <Input
                            id="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('start_date', e.target.value)}
                            required
                            className="bg-white/50 dark:bg-slate-700/50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="end_date">End Date</Label>
                          <Input
                            id="end_date"
                            type="date"
                            value={formData.end_date}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('end_date', e.target.value)}
                            disabled={formData.is_current}
                            className="bg-white/50 dark:bg-slate-700/50 disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_current"
                          checked={formData.is_current}
                          onChange={(e) => handleInputChange('is_current', e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <Label htmlFor="is_current">I currently work here</Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Job Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your responsibilities, achievements, and key contributions..."
                          value={formData.description || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                          rows={4}
                          className="bg-white/50 dark:bg-slate-700/50 resize-none"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="neutral"
                          onClick={handleCloseDialog}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : editingExperience ? 'Update' : 'Add'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <AnimatePresence mode="popLayout">
                {experience.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-12"
                  >
                    <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No Experience Added Yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Add your work experience to showcase your professional background
                    </p>
                  </motion.div>
                ) : (
                  experience.map((exp, index) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200/50 dark:border-slate-600/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {exp.job_title}
                          </h4>
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                            <Building className="w-4 h-4 mr-1" />
                            {exp.company_name}
                          </div>
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(exp.start_date).getFullYear()} - {
                              exp.is_current ? 'Present' :
                              exp.end_date ? new Date(exp.end_date).getFullYear() :
                              'Present'
                            }
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            {exp.employment_type}
                          </div>
                          {exp.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                              {exp.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="neutral"
                            onClick={() => handleOpenDialog(exp)}
                            disabled={saving}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="neutral"
                            onClick={() => handleDelete(exp.id)}
                            disabled={saving}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
              <Button
                onClick={handleBack}
                variant="neutral"
                className="flex-1"
                disabled={saving}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                disabled={saving}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
