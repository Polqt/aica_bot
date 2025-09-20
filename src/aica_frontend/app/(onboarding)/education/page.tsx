'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, GraduationCap, Plus, Edit, Trash2, Calendar, Building } from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { UserEducation, UserEducationCreate } from '@/types/user';

export default function EducationPage() {
  const router = useRouter();
  const { education, addEducation, updateEducation, deleteEducation, loadResumeData, loading, saving } = useResumeBuilder();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<UserEducation | null>(null);
  const [formData, setFormData] = useState<UserEducationCreate>({
    institution_name: '',
    degree_type: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  const resetForm = () => {
    setFormData({
      institution_name: '',
      degree_type: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      is_current: false,
    });
    setEditingEducation(null);
  };

  const handleOpenDialog = (education?: UserEducation) => {
    if (education) {
      setEditingEducation(education);
      setFormData({
        institution_name: education.institution_name,
        degree_type: education.degree_type,
        field_of_study: education.field_of_study,
        start_date: education.start_date,
        end_date: education.end_date || '',
        is_current: education.is_current,
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

  const handleInputChange = (field: keyof UserEducationCreate, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEducation) {
      await updateEducation(editingEducation.id, formData);
    } else {
      await addEducation(formData);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this education entry?')) {
      await deleteEducation(id);
    }
  };

  const handleContinue = () => {
    router.push('/experience');
  };

  const handleBack = () => {
    router.push('/profile');
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
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Education Background
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Add your educational qualifications to strengthen your profile
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Education List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Your Education
                </h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleOpenDialog()}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                      disabled={saving}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Education
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
                    <DialogHeader>
                      <DialogTitle>
                        {editingEducation ? 'Edit Education' : 'Add Education'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingEducation ? 'Update your education details' : 'Add your educational background'}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="institution_name">Institution Name *</Label>
                        <Input
                          id="institution_name"
                          type="text"
                          placeholder="University of Example"
                          value={formData.institution_name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('institution_name', e.target.value)}
                          required
                          className="bg-white/50 dark:bg-slate-700/50"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="degree_type">Degree Type *</Label>
                          <select
                            id="degree_type"
                            value={formData.degree_type}
                            onChange={(e) => handleInputChange('degree_type', e.target.value)}
                            required
                            className="w-full h-10 px-3 py-2 bg-white/50 dark:bg-slate-700/50 border-2 border-border rounded-base text-sm font-base text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black"
                          >
                            <option value="">Select degree type</option>
                            <option value="Bachelor's">Bachelor Degree</option>
                            <option value="Master's">Master Degree</option>
                            <option value="PhD">PhD</option>
                            <option value="Associate">Associate</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Certificate">Certificate</option>
                            <option value="High School">High School</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="field_of_study">Field of Study *</Label>
                          <Input
                            id="field_of_study"
                            type="text"
                            placeholder="Computer Science"
                            value={formData.field_of_study}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('field_of_study', e.target.value)}
                            required
                            className="bg-white/50 dark:bg-slate-700/50"
                          />
                        </div>
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
                        <Label htmlFor="is_current">I am currently studying here</Label>
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
                          {saving ? 'Saving...' : editingEducation ? 'Update' : 'Add'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <AnimatePresence mode="popLayout">
                {education.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-12"
                  >
                    <GraduationCap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No Education Added Yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Add your educational background to help match you with relevant opportunities
                    </p>
                  </motion.div>
                ) : (
                  education.map((edu, index) => (
                    <motion.div
                      key={edu.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200/50 dark:border-slate-600/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {edu.degree_type} in {edu.field_of_study}
                          </h4>
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                            <Building className="w-4 h-4 mr-1" />
                            {edu.institution_name}
                          </div>
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(edu.start_date).getFullYear()} - {
                              edu.is_current ? 'Present' :
                              edu.end_date ? new Date(edu.end_date).getFullYear() :
                              'Present'
                            }
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="neutral"
                            onClick={() => handleOpenDialog(edu)}
                            disabled={saving}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="neutral"
                            onClick={() => handleDelete(edu.id)}
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
