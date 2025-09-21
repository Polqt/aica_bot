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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="p-12"
    >
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-600/25">
          <Briefcase className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6">
          WORK EXPERIENCE
        </h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 font-bold max-w-2xl mx-auto">
          SHARE YOUR PROFESSIONAL JOURNEY AND ACCOMPLISHMENTS WITH OUR AI CAREER ASSISTANT
        </p>
      </div>

      {/* Content Section */}
      <div className="space-y-8">
        {/* Experience List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-black text-black uppercase tracking-wide">
              YOUR EXPERIENCE
            </h3>
            <button
              onClick={() => handleOpenDialog()}
              disabled={saving}
              className="bg-green-400 border-4 border-black px-8 py-4 font-black text-xl text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50 flex items-center gap-3"
            >
              <Plus className="w-6 h-6" />
              ADD EXPERIENCE
            </button>

            {isDialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white border-4 border-black p-8 max-w-2xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
                  <div className="mb-6">
                    <h2 className="text-3xl font-black text-black uppercase tracking-wider mb-2">
                      {editingExperience ? 'EDIT EXPERIENCE' : 'ADD EXPERIENCE'}
                    </h2>
                    <p className="text-lg font-bold text-black uppercase">
                      {editingExperience ? 'UPDATE YOUR WORK EXPERIENCE DETAILS' : 'ADD YOUR PROFESSIONAL BACKGROUND'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-yellow-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <label htmlFor="company_name" className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-6 bg-red-500 border-2 border-black"></div>
                          <span className="text-lg font-black text-black uppercase">Company Name *</span>
                        </label>
                        <input
                          id="company_name"
                          type="text"
                          placeholder="TECH CORP INC."
                          value={formData.company_name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('company_name', e.target.value)}
                          required
                          className="w-full p-3 text-lg font-bold bg-white border-4 border-black uppercase placeholder:text-gray-500 focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                      </div>

                      <div className="bg-yellow-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <label htmlFor="job_title" className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-6 bg-blue-500 border-2 border-black"></div>
                          <span className="text-lg font-black text-black uppercase">Job Title *</span>
                        </label>
                        <input
                          id="job_title"
                          type="text"
                          placeholder="SOFTWARE ENGINEER"
                          value={formData.job_title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('job_title', e.target.value)}
                          required
                          className="w-full p-3 text-lg font-bold bg-white border-4 border-black uppercase placeholder:text-gray-500 focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                      </div>
                    </div>

                    <div className="bg-yellow-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <label htmlFor="employment_type" className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-green-500 border-2 border-black"></div>
                        <span className="text-lg font-black text-black uppercase">Employment Type *</span>
                      </label>
                      <select
                        id="employment_type"
                        value={formData.employment_type}
                        onChange={(e) => handleInputChange('employment_type', e.target.value)}
                        required
                        className="w-full p-3 text-lg font-bold bg-white border-4 border-black uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <option value="">SELECT EMPLOYMENT TYPE</option>
                        <option value="Full-time">FULL-TIME</option>
                        <option value="Part-time">PART-TIME</option>
                        <option value="Contract">CONTRACT</option>
                        <option value="Freelance">FREELANCE</option>
                        <option value="Internship">INTERNSHIP</option>
                        <option value="Apprenticeship">APPRENTICESHIP</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-yellow-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <label htmlFor="start_date" className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-6 bg-purple-500 border-2 border-black"></div>
                          <span className="text-lg font-black text-black uppercase">Start Date *</span>
                        </label>
                        <input
                          id="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('start_date', e.target.value)}
                          required
                          className="w-full p-3 text-lg font-bold bg-white border-4 border-black focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                      </div>

                      <div className="bg-yellow-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <label htmlFor="end_date" className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-6 bg-orange-500 border-2 border-black"></div>
                          <span className="text-lg font-black text-black uppercase">End Date</span>
                        </label>
                        <input
                          id="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('end_date', e.target.value)}
                          disabled={formData.is_current}
                          className="w-full p-3 text-lg font-bold bg-white border-4 border-black focus:outline-none focus:bg-yellow-100 disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                      </div>
                    </div>

                    <div className="bg-yellow-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="is_current"
                          checked={formData.is_current}
                          onChange={(e) => handleInputChange('is_current', e.target.checked)}
                          className="w-6 h-6 border-4 border-black"
                        />
                        <span className="text-lg font-black text-black uppercase ml-3">I AM CURRENTLY WORKING HERE</span>
                      </label>
                    </div>

                    <div className="bg-yellow-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <label htmlFor="description" className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-pink-500 border-2 border-black"></div>
                        <span className="text-lg font-black text-black uppercase">Job Description</span>
                      </label>
                      <textarea
                        id="description"
                        placeholder="DESCRIBE YOUR RESPONSIBILITIES, ACHIEVEMENTS, AND KEY CONTRIBUTIONS..."
                        value={formData.description || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full p-3 text-lg font-bold bg-white border-4 border-black uppercase placeholder:text-gray-500 focus:outline-none focus:bg-yellow-100 resize-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                    </div>

                    <div className="flex gap-6 pt-6">
                      <button
                        type="button"
                        onClick={handleCloseDialog}
                        className="flex-1 bg-gray-400 border-4 border-black p-4 font-black text-xl text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-red-500 border-4 border-black p-4 font-black text-xl text-white uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {saving ? (
                          <>
                            <div className="w-6 h-6 bg-white border-2 border-black animate-spin"></div>
                            SAVING...
                          </>
                        ) : (
                          editingExperience ? 'UPDATE' : 'ADD'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {experience.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-16 bg-gray-200 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="w-20 h-20 bg-black border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-black uppercase tracking-wider mb-4">
                  NO EXPERIENCE ADDED YET
                </h3>
                <p className="text-lg font-bold text-black uppercase max-w-md mx-auto">
                  ADD YOUR WORK EXPERIENCE TO SHOWCASE YOUR PROFESSIONAL BACKGROUND
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
                  className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-xl font-black text-black uppercase mb-2">
                        {exp.job_title}
                      </h4>
                      <div className="flex items-center text-lg font-bold text-black mb-2">
                        <div className="w-6 h-6 bg-blue-500 border-2 border-black mr-3"></div>
                        <span className="uppercase">{exp.company_name}</span>
                      </div>
                      <div className="flex items-center text-lg font-bold text-black mb-2">
                        <div className="w-6 h-6 bg-green-500 border-2 border-black mr-3"></div>
                        <span className="uppercase">
                          {new Date(exp.start_date).getFullYear()} - {
                            exp.is_current ? 'PRESENT' :
                            exp.end_date ? new Date(exp.end_date).getFullYear() :
                            'PRESENT'
                          }
                        </span>
                      </div>
                      <div className="text-lg font-bold text-black uppercase mb-2">
                        {exp.employment_type}
                      </div>
                      {exp.description && (
                        <p className="text-lg font-bold text-black uppercase">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleOpenDialog(exp)}
                        disabled={saving}
                        className="w-12 h-12 bg-yellow-400 border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50"
                      >
                        <Edit className="w-6 h-6 text-black" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        disabled={saving}
                        className="w-12 h-12 bg-red-500 border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50"
                      >
                        <Trash2 className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-6 pt-8">
          <button
            onClick={handleBack}
            disabled={saving}
            className="flex-1 bg-gray-400 border-4 border-black p-6 font-black text-xl text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <ArrowLeft className="w-6 h-6" />
            BACK
          </button>
          <button
            onClick={handleContinue}
            disabled={saving}
            className="flex-1 bg-red-500 border-4 border-black p-6 font-black text-xl text-white uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50 flex items-center justify-center gap-3"
          >
            CONTINUE
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
