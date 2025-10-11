'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { UserExperience, UserExperienceCreate } from '@/types/user';

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship',
  'Freelance',
];

export default function ExperiencePage() {
  const router = useRouter();
  const {
    experience,
    addExperience,
    updateExperience,
    deleteExperience,
    loadResumeData,
    loading,
    saving,
  } = useResumeBuilder();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] =
    useState<UserExperience | null>(null);
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

  const handleInputChange = (
    field: keyof UserExperienceCreate,
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

    const formattedData = {
      ...formData,
      start_date: formatDateToISO(formData.start_date),
      end_date: formData.is_current
        ? undefined
        : formData.end_date
        ? formatDateToISO(formData.end_date)
        : undefined,
    };

    try {
      if (editingExperience) {
        await updateExperience(editingExperience.id, formattedData);
      } else {
        await addExperience(formattedData);
      }
      handleCloseDialog();
    } catch {
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
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
              Work Experience
            </h1>
            <p className="text-gray-600 text-base mt-1">
              Add your work history to showcase your professional journey.
            </p>
          </div>

          <div className="h-[1px] bg-gray-200" />
        </div>

        <div className="max-w-3xl space-y-6">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {experience?.map(exp => (
                <motion.div
                  key={exp.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group p-4 bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-md bg-blue-50 text-blue-600">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {exp.job_title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {exp.company_name} • {exp.employment_type}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {exp.start_date} -{' '}
                          {exp.is_current ? 'Present' : exp.end_date}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenDialog(exp)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
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
              Add Experience
            </Button>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <Button onClick={handleBack} variant="neutral" className="h-10">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!experience?.length || saving}
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {editingExperience ? 'Edit Experience' : 'Add Experience'}
          </DialogTitle>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600">
                Fill in your work experience details below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={e =>
                      handleInputChange('company_name', e.target.value)
                    }
                    placeholder="Google"
                    required
                  />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-1.5">
                  <Label htmlFor="job_title">Job Title *</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={e =>
                      handleInputChange('job_title', e.target.value)
                    }
                    placeholder="Software Engineer"
                    required
                  />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-1.5">
                  <Label htmlFor="employment_type">Employment Type *</Label>
                  <Select
                    value={formData.employment_type}
                    onValueChange={value =>
                      handleInputChange('employment_type', value)
                    }
                  >
                    <SelectTrigger id="employment_type" className="h-10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

                <div className="col-span-2 flex items-center">
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
                    I currently work here
                  </label>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Describe your responsibilities and achievements..."
                    className="h-32 resize-none"
                  />
                </div>
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
                  {editingExperience ? 'Update' : 'Add'} Experience
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
