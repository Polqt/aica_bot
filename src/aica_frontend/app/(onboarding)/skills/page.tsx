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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="p-12"
    >
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-600/25">
          <Zap className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6">
          SKILLS & EXPERTISE
        </h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 font-bold max-w-2xl mx-auto">
          HIGHLIGHT YOUR TECHNICAL SKILLS AND COMPETENCIES FOR BETTER JOB MATCHING
        </p>
      </div>

      {/* Content Section */}
      <div className="space-y-8">
        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-900/20 dark:to-purple-900/20 rounded-3xl p-8 border-4 border-black shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-pink-500 border-4 border-black rounded-2xl flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-black uppercase tracking-wide">
              ADD NEW SKILL
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <label htmlFor="skill_name" className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 bg-red-500 border-2 border-black"></div>
                <span className="text-lg font-black text-black uppercase">Skill Name *</span>
              </label>
              <input
                id="skill_name"
                type="text"
                placeholder="JAVASCRIPT, PYTHON, REACT..."
                value={newSkill}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkill(e.target.value)}
                className="w-full p-3 text-lg font-bold bg-white border-4 border-black uppercase placeholder:text-gray-500 focus:outline-none focus:bg-pink-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <label htmlFor="proficiency" className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 bg-blue-500 border-2 border-black"></div>
                <span className="text-lg font-black text-black uppercase">Proficiency</span>
              </label>
              <select
                id="proficiency"
                value={proficiencyLevel}
                onChange={(e) => setProficiencyLevel(e.target.value)}
                className="w-full p-3 text-lg font-bold bg-white border-4 border-black uppercase focus:outline-none focus:bg-pink-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {proficiencyOptions.map((option) => (
                  <option key={option.value} value={option.value} className="uppercase">
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
              className="bg-green-400 border-4 border-black px-8 py-4 font-black text-xl text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50 flex items-center gap-3"
            >
              <Plus className="w-6 h-6" />
              {saving ? 'ADDING...' : 'ADD SKILL'}
            </button>
          </div>
        </form>

        {/* Skills List */}
        <div className="space-y-6">
          <h3 className="text-3xl font-black text-black uppercase tracking-wide">
            YOUR SKILLS ({skills.length})
          </h3>

          <AnimatePresence mode="popLayout">
            {skills.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-16 bg-gray-200 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="w-20 h-20 bg-black border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-black uppercase tracking-wider mb-4">
                  NO SKILLS ADDED YET
                </h3>
                <p className="text-lg font-bold text-black uppercase max-w-md mx-auto">
                  ADD YOUR TECHNICAL SKILLS AND EXPERTISE TO IMPROVE JOB MATCHING
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-yellow-400 border-2 border-black rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4 text-black" />
                        </div>
                        <div>
                          <span className="text-lg font-black text-black uppercase">
                            {skill.skill_name}
                          </span>
                          {skill.proficiency_level && (
                            <div className="bg-violet-400 border-2 border-black px-3 py-1 mt-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <span className="text-sm font-black text-black uppercase">
                                {skill.proficiency_level}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        disabled={saving}
                        className="w-10 h-10 bg-red-500 border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50 opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
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
            COMPLETE SETUP
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
