'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { UserEducation, UserEducationCreate } from '@/types/user';
import { PageLoader } from '@/components/PageLoader';

export default function EducationPage() {
  const router = useRouter();
  const {
    education,
    addEducation,
    updateEducation,
    deleteEducation,
    loadResumeData,
    loading,
    saving,
  } = useResumeBuilder();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] =
    useState<UserEducation | null>(null);
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

  const handleInputChange = (
    field: keyof UserEducationCreate,
    value: string | boolean,
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDateToISO = (dateString: string) => {
    if (!dateString) return '';
    // Add the first day of the month to make it a valid ISO date
    return `${dateString}-01`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedData: UserEducationCreate = {
      ...formData,
      start_date: formatDateToISO(formData.start_date),
      end_date: formData.is_current
        ? undefined
        : formData.end_date
        ? formatDateToISO(formData.end_date)
        : undefined,
    };

    if (editingEducation) {
      await updateEducation(editingEducation.id, formattedData);
    } else {
      await addEducation(formattedData);
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
    return <PageLoader variant="minimal" fullScreen={false} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      <div className="p-8">
        <div className="space-y-6 mb-8">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              Education History
            </h1>
            <p className="text-gray-600 text-base mt-1">
              Add your educational background to strengthen your resume.
            </p>
          </div>

          <div className="h-[1px] bg-gray-200" />
        </div>

        <div className="max-w-3xl space-y-6">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {education?.map(edu => (
                <motion.div
                  key={edu.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group p-4 bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-md bg-blue-50 text-blue-600">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {edu.degree_type} in {edu.field_of_study}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {edu.institution_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {edu.start_date} -{' '}
                          {edu.is_current ? 'Present' : edu.end_date}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenDialog(edu)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(edu.id)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              onClick={() => handleOpenDialog()}
              variant="neutral"
              className="w-full h-16 border-dashed hover:border-gray-400 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <Button onClick={handleBack} variant="neutral" className="h-10">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!education?.length || saving}
              className="h-10"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>
            {editingEducation ? 'Edit Education' : 'Add Education'}
          </DialogTitle>
          <DialogDescription>
            Fill in your educational background details below.
          </DialogDescription>
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="institution_name">Institution Name *</Label>
                <Input
                  id="institution_name"
                  value={formData.institution_name}
                  onChange={e =>
                    handleInputChange('institution_name', e.target.value)
                  }
                  placeholder="University of Example"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="degree_type">Degree Type *</Label>
                  <Input
                    id="degree_type"
                    value={formData.degree_type}
                    onChange={e =>
                      handleInputChange('degree_type', e.target.value)
                    }
                    placeholder="Bachelor's"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="field_of_study">Field of Study *</Label>
                  <Input
                    id="field_of_study"
                    value={formData.field_of_study}
                    onChange={e =>
                      handleInputChange('field_of_study', e.target.value)
                    }
                    placeholder="Computer Science"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="month"
                    value={formData.start_date}
                    onChange={e =>
                      handleInputChange('start_date', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="month"
                    value={formData.end_date}
                    onChange={e =>
                      handleInputChange('end_date', e.target.value)
                    }
                    disabled={formData.is_current}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={formData.is_current}
                  onChange={e =>
                    handleInputChange('is_current', e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <label
                  htmlFor="is_current"
                  className="ml-2 text-sm text-gray-700"
                >
                  Currently studying here
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  onClick={handleCloseDialog}
                  variant="neutral"
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEducation ? 'Update' : 'Add'} Education
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
