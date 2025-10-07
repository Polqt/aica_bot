'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, GraduationCap, Plus, Edit, Trash2 } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8"
    >
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Education background
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Add your educational qualifications to strengthen your profile
        </p>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {/* Education List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Your education
            </h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={() => handleOpenDialog()}
                  disabled={saving}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add education
                </button>
              </DialogTrigger>

              <DialogContent className="bg-white border border-gray-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {editingEducation ? 'Edit education' : 'Add education'}
                  </h2>
                  <p className="text-gray-600">
                    {editingEducation ? 'Update your education details' : 'Add your educational background'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="institution_name" className="text-sm font-semibold text-gray-900">
                      Institution Name *
                    </Label>
                    <Input
                      id="institution_name"
                      type="text"
                      placeholder="University of Example"
                      value={formData.institution_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('institution_name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="degree_type" className="text-sm font-semibold text-gray-900">
                        Degree Type *
                      </Label>
                      <select
                        id="degree_type"
                        value={formData.degree_type}
                        onChange={(e) => handleInputChange('degree_type', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      >
                        <option value="">Select degree type</option>
                        <option value="Bachelor's">Bachelor&apos;s</option>
                        <option value="Master's">Master&apos;s</option>
                        <option value="PhD">PhD</option>
                        <option value="Associate">Associate</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Certificate">Certificate</option>
                        <option value="High School">High School</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="field_of_study" className="text-sm font-semibold text-gray-900">
                        Field of Study *
                      </Label>
                      <Input
                        id="field_of_study"
                        type="text"
                        placeholder="Computer Science"
                        value={formData.field_of_study}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('field_of_study', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="start_date" className="text-sm font-semibold text-gray-900">
                        Start Date *
                      </Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('start_date', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="end_date" className="text-sm font-semibold text-gray-900">
                        End Date
                      </Label>
                      <Input
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
                    <Label htmlFor="is_current" className="text-sm font-medium text-gray-900">
                      I am currently studying here
                    </Label>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      onClick={handleCloseDialog}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
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
                        editingEducation ? 'Update' : 'Add'
                      )}
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
                className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No education added yet
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
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
                  className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {edu.degree_type} in {edu.field_of_study}
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{edu.institution_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>
                            {new Date(edu.start_date).getFullYear()} - {
                              edu.is_current ? 'Present' :
                              edu.end_date ? new Date(edu.end_date).getFullYear() :
                              'Present'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenDialog(edu)}
                        disabled={saving}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(edu.id)}
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
    </motion.div>
  );
}
