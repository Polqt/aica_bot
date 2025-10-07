'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Zap, Plus, X, Star } from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function SkillsPage() {
  const router = useRouter();
  const { skills, addSkill, deleteSkill, loadResumeData, loading, saving } = useResumeBuilder();
  const [newSkill, setNewSkill] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('');

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSkill.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    await addSkill({
      skill_name: newSkill.trim(),
      proficiency_level: proficiencyLevel || undefined,
    });
    setNewSkill('');
    setProficiencyLevel('');
  };

  const handleDeleteSkill = async (id: string) => {
    await deleteSkill(id);
  };

  const handleContinue = async () => {
    try {
      console.log('Completing onboarding - marking profile as completed');
      // Mark profile as completed
      const updateResult = await apiClient.updateProfile({ profile_completed: true });
      console.log('Profile update result:', updateResult);

      toast.success('Profile setup completed! Redirecting to dashboard...');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast.error('Profile setup completed, but there was an issue');
    }

    console.log('Redirecting to dashboard');
    router.push('/dashboard');
  };

  const handleBack = () => {
    router.push('/experience');
  };

  const proficiencyOptions = [
    { value: '', label: 'Not specified' },
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' },
  ];

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
          <Zap className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Skills & expertise
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Highlight your technical skills and competencies for better job matching
        </p>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Add new skill
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <label htmlFor="skill_name" className="text-sm font-semibold text-gray-900">
                Skill Name *
              </label>
              <input
                id="skill_name"
                type="text"
                placeholder="JavaScript, Python, React..."
                value={newSkill}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkill(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="proficiency" className="text-sm font-semibold text-gray-900">
                Proficiency
              </label>
              <select
                id="proficiency"
                value={proficiencyLevel}
                onChange={(e) => setProficiencyLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                {proficiencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={saving || !newSkill.trim()}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {saving ? 'Adding...' : 'Add skill'}
            </button>
          </div>
        </form>

        {/* Skills List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Your skills ({skills.length})
          </h3>

          <AnimatePresence mode="popLayout">
            {skills.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No skills added yet
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Add your technical skills and expertise to improve job matching
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900">
                            {skill.skill_name}
                          </span>
                          {skill.proficiency_level && (
                            <div className="bg-violet-100 text-violet-700 px-2 py-1 mt-1 rounded text-xs font-medium">
                              {skill.proficiency_level}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        disabled={saving}
                        className="w-8 h-8 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
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
            Complete setup
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
