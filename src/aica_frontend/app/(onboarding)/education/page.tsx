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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="p-12"
    >
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-600/25">
          <GraduationCap className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6">
          EDUCATION BACKGROUND
        </h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 font-bold max-w-2xl mx-auto">
          ADD YOUR EDUCATIONAL QUALIFICATIONS TO STRENGTHEN YOUR PROFILE
        </p>
      </div>

      {/* Content Section */}
      <div className="space-y-8">
        {/* Education List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-black text-black uppercase tracking-wide">
              YOUR EDUCATION
            </h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => handleOpenDialog()}
                  disabled={saving}
                  className="bg-green-400 border-4 border-black px-8 py-4 font-black text-xl text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50 flex items-center gap-3"
                >
                  <Plus className="w-6 h-6" />
                  ADD EDUCATION
                </Button>
              </DialogTrigger>

              <DialogContent className="bg-white border-4 border-black p-8 max-w-2xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-3xl font-black text-black uppercase tracking-wider mb-2">
                    {editingEducation ? 'EDIT EDUCATION' : 'ADD EDUCATION'}
                  </h2>
                  <p className="text-lg font-bold text-black uppercase">
                    {editingEducation ? 'UPDATE YOUR EDUCATION DETAILS' : 'ADD YOUR EDUCATIONAL BACKGROUND'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-yellow-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Label htmlFor="institution_name" className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-6 bg-red-500 border-2 border-black"></div>
                      <span className="text-lg font-black text-black uppercase">Institution Name *</span>
                    </Label>
                    <Input
                      id="institution_name"
                      type="text"
                      placeholder="UNIVERSITY OF EXAMPLE"
                      value={formData.institution_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('institution_name', e.target.value)}
                      required
                      className="w-full p-3 text-lg font-bold bg-white border-4 border-black uppercase placeholder:text-gray-500 focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-yellow-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Label htmlFor="degree_type" className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-blue-500 border-2 border-black"></div>
                        <span className="text-lg font-black text-black uppercase">Degree Type *</span>
                      </Label>
                      <select
                        id="degree_type"
                        value={formData.degree_type}
                        onChange={(e) => handleInputChange('degree_type', e.target.value)}
                        required
                        className="w-full p-3 text-lg font-bold bg-white border-4 border-black uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <option value="">SELECT DEGREE TYPE</option>
                        <option value="Bachelor's">BACHELOR DEGREE</option>
                        <option value="Master's">MASTER DEGREE</option>
                        <option value="PhD">PHD</option>
                        <option value="Associate">ASSOCIATE</option>
                        <option value="Diploma">DIPLOMA</option>
                        <option value="Certificate">CERTIFICATE</option>
                        <option value="High School">HIGH SCHOOL</option>
                      </select>
                    </div>

                    <div className="bg-yellow-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Label htmlFor="field_of_study" className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-green-500 border-2 border-black"></div>
                        <span className="text-lg font-black text-black uppercase">Field of Study *</span>
                      </Label>
                      <Input
                        id="field_of_study"
                        type="text"
                        placeholder="COMPUTER SCIENCE"
                        value={formData.field_of_study}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('field_of_study', e.target.value)}
                        required
                        className="w-full p-3 text-lg font-bold bg-white border-4 border-black uppercase placeholder:text-gray-500 focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-yellow-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Label htmlFor="start_date" className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-purple-500 border-2 border-black"></div>
                        <span className="text-lg font-black text-black uppercase">Start Date *</span>
                      </Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('start_date', e.target.value)}
                        required
                        className="w-full p-3 text-lg font-bold bg-white border-4 border-black focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                    </div>

                    <div className="bg-yellow-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Label htmlFor="end_date" className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-orange-500 border-2 border-black"></div>
                        <span className="text-lg font-black text-black uppercase">End Date</span>
                      </Label>
                      <Input
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
                      <span className="text-lg font-black text-black uppercase ml-3">I AM CURRENTLY STUDYING HERE</span>
                    </label>
                  </div>

                  <div className="flex gap-6 pt-6">
                    <Button
                      type="button"
                      onClick={handleCloseDialog}
                      className="flex-1 bg-gray-400 border-4 border-black p-4 font-black text-xl text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                    >
                      CANCEL
                    </Button>
                    <Button
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
                        editingEducation ? 'UPDATE' : 'ADD'
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
                className="text-center py-16 bg-gray-200 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="w-20 h-20 bg-black border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-black uppercase tracking-wider mb-4">
                  NO EDUCATION ADDED YET
                </h3>
                <p className="text-lg font-bold text-black uppercase max-w-md mx-auto">
                  ADD YOUR EDUCATIONAL BACKGROUND TO HELP MATCH YOU WITH RELEVANT OPPORTUNITIES
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
                  className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-xl font-black text-black uppercase mb-2">
                        {edu.degree_type} in {edu.field_of_study}
                      </h4>
                      <div className="flex items-center text-lg font-bold text-black mb-2">
                        <div className="w-6 h-6 bg-blue-500 border-2 border-black mr-3"></div>
                        <span className="uppercase">{edu.institution_name}</span>
                      </div>
                      <div className="flex items-center text-lg font-bold text-black mb-2">
                        <div className="w-6 h-6 bg-green-500 border-2 border-black mr-3"></div>
                        <span className="uppercase">
                          {new Date(edu.start_date).getFullYear()} - {
                            edu.is_current ? 'PRESENT' :
                            edu.end_date ? new Date(edu.end_date).getFullYear() :
                            'PRESENT'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleOpenDialog(edu)}
                        disabled={saving}
                        className="w-12 h-12 bg-yellow-400 border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50"
                      >
                        <Edit className="w-6 h-6 text-black" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(edu.id)}
                        disabled={saving}
                        className="w-12 h-12 bg-red-500 border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50"
                      >
                        <Trash2 className="w-6 h-6 text-white" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-6 pt-8">
          <Button
            onClick={handleBack}
            disabled={saving}
            className="flex-1 bg-gray-400 border-4 border-black p-6 font-black text-xl text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <ArrowLeft className="w-6 h-6" />
            BACK
          </Button>
          <Button
            onClick={handleContinue}
            disabled={saving}
            className="flex-1 bg-red-500 border-4 border-black p-6 font-black text-xl text-white uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50 flex items-center justify-center gap-3"
          >
            CONTINUE
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
