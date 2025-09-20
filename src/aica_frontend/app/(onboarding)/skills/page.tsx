'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Zap, Plus, X, Star } from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
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

  const handleContinue = () => {
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
              <Zap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Skills & Expertise
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Highlight your technical skills and competencies
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="skill_name">Skill Name *</Label>
                  <Input
                    id="skill_name"
                    type="text"
                    placeholder="e.g., JavaScript, Python, React..."
                    value={newSkill}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkill(e.target.value)}
                    className="bg-white/50 dark:bg-slate-700/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proficiency">Proficiency Level</Label>
                  <select
                    id="proficiency"
                    value={proficiencyLevel}
                    onChange={(e) => setProficiencyLevel(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-white/50 dark:bg-slate-700/50 border-2 border-border rounded-base text-sm font-base text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black"
                  >
                    {proficiencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                disabled={saving || !newSkill.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                {saving ? 'Adding...' : 'Add Skill'}
              </Button>
            </form>

            {/* Skills List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Your Skills ({skills.length})
              </h3>

              <AnimatePresence mode="popLayout">
                {skills.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-12"
                  >
                    <Zap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No Skills Added Yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Add your technical skills and expertise to improve job matching
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {skills.map((skill, index) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-600/50 flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-violet-600" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {skill.skill_name}
                          </span>
                          {skill.proficiency_level && (
                            <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded">
                              {skill.proficiency_level}
                            </span>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="neutral"
                          onClick={() => handleDeleteSkill(skill.id)}
                          disabled={saving}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
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
                Complete Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
