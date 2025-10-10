'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Zap, X, Star, Check } from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import skillsData from '@/data/skills.json';

export default function SkillsPage() {
  const router = useRouter();
  const { skills, addSkill, deleteSkill, loadResumeData, loading, saving } = useResumeBuilder();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  // Initialize selected skills from existing skills
  useEffect(() => {
    const existingSkillNames = new Set(skills.map(skill => skill.skill_name));
    setSelectedSkills(existingSkillNames);
  }, [skills]);

  const handleSkillToggle = async (skillName: string) => {
    const isSelected = selectedSkills.has(skillName);

    if (isSelected) {
      // Remove skill
      const skillToDelete = skills.find(s => s.skill_name === skillName);
      if (skillToDelete) {
        await deleteSkill(skillToDelete.id);
        setSelectedSkills(prev => {
          const newSet = new Set(prev);
          newSet.delete(skillName);
          return newSet;
        });
      }
    } else {
      // Add skill
      await addSkill({
        skill_name: skillName,
      });
      setSelectedSkills(prev => new Set([...prev, skillName]));
    }
  };

  const handleAddCustomSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillName = (e.target as HTMLFormElement).skill_name.value.trim();

    if (!skillName) {
      toast.error('Please enter a skill name');
      return;
    }

    await addSkill({
      skill_name: skillName,
    });
    setSelectedSkills(prev => new Set([...prev, skillName]));
    (e.target as HTMLFormElement).reset();
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
        {/* Tech Stack Selection */}
        <div className="space-y-6">
          {/* Category Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Select your tech stack
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {skillsData.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedCategory === category.id
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {category.skills.length} skills
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Skills Selection */}
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {skillsData.categories.find(cat => cat.id === selectedCategory)?.name}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {skillsData.categories
                  .find(cat => cat.id === selectedCategory)
                  ?.skills.map((skill) => {
                    const isSelected = selectedSkills.has(skill) || skills.some(s => s.skill_name === skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => handleSkillToggle(skill)}
                        disabled={saving}
                        className={`p-3 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                          isSelected
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{skill}</span>
                          {isSelected && <Check className="w-4 h-4 text-green-600" />}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {/* Custom Skill Form */}
          <form onSubmit={handleAddCustomSkill} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Add custom skill
            </h4>
            <div className="flex gap-3">
              <input
                name="skill_name"
                type="text"
                placeholder="Enter a custom skill..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </div>

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
                        <span className="text-sm font-semibold text-gray-900">
                          {skill.skill_name}
                        </span>
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
