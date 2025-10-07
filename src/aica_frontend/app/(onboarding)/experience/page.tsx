'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Briefcase, Plus, Edit, Trash2 } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8"
    >
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Work experience
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Share your professional journey and accomplishments with our AI career assistant
        </p>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {/* Experience List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Your experience
            </h3>
            <button
              onClick={() => handleOpenDialog()}
              disabled={saving}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add experience
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {experience.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No experience added yet
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
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
                  className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {exp.job_title}
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{exp.company_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>
                            {new Date(exp.start_date).getFullYear()} - {
                              exp.is_current ? 'Present' :
                              exp.end_date ? new Date(exp.end_date).getFullYear() :
                              'Present'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>{exp.employment_type}</span>
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-gray-700 mt-3 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenDialog(exp)}
                        disabled={saving}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        disabled={saving}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-6">
          <button
            onClick={handleBack}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {editingExperience ? 'Edit experience' : 'Add experience'}
              </h2>
              <p className="text-gray-600">
                {editingExperience ? 'Update your work experience details' : 'Add your professional background'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label htmlFor="company_name" className="text-sm font-semibold text-gray-900">
                    Company Name *
                  </label>
                  <input
                    id="company_name"
                    type="text"
                    placeholder="Tech Corp Inc."
                    value={formData.company_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('company_name', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="job_title" className="text-sm font-semibold text-gray-900">
                    Job Title *
                  </label>
                  <input
                    id="job_title"
                    type="text"
                    placeholder="Software Engineer"
                    value={formData.job_title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('job_title', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="employment_type" className="text-sm font-semibold text-gray-900">
                  Employment Type *
                </label>
                <select
                  id="employment_type"
                  value={formData.employment_type}
                  onChange={(e) => handleInputChange('employment_type', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label htmlFor="start_date" className="text-sm font-semibold text-gray-900">
                    Start Date *
                  </label>
                  <input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('start_date', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="end_date" className="text-sm font-semibold text-gray-900">
                    End Date
                  </label>
                  <input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('end_date', e.target.value)}
                    disabled={formData.is_current}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={formData.is_current}
                  onChange={(e) => handleInputChange('is_current', e.target.checked)}
                  className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                />
                <label htmlFor="is_current" className="text-sm font-medium text-gray-900">
                  I am currently working here
                </label>
              </div>

              <div className="space-y-3">
                <label htmlFor="description" className="text-sm font-semibold text-gray-900">
                  Job Description
                </label>
                <textarea
                  id="description"
                  placeholder="Describe your responsibilities, achievements, and key contributions..."
                  value={formData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    editingExperience ? 'Update' : 'Add'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
