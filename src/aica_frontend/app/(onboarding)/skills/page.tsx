'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { toast } from 'sonner';
import skillsData from '@/data/skills.json';

export default function SkillsPage() {
  const router = useRouter();
  const { skills, addSkill, deleteSkill, loadResumeData, loading, saving } =
    useResumeBuilder();
  const {
    status: completionStatus,
    matchesFound,
    completeProfileAndMatch,
  } = useProfileCompletion();
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [showCustomSkillForm, setShowCustomSkillForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  useEffect(() => {
    const existingSkillNames = new Set(skills.map(skill => skill.skill_name));
    setSelectedSkills(existingSkillNames);
  }, [skills]);

  const handleSkillToggle = async (skillName: string) => {
    const isSelected = selectedSkills.has(skillName);
    if (isSelected) {
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
      await addSkill({ skill_name: skillName });
      setSelectedSkills(prev => new Set([...prev, skillName]));
    }
  };

  const handleAddCustomSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const skillName = form.skill_name.value.trim();

    if (!skillName) {
      toast.error('Please enter a skill name');
      return;
    }
    setSelectedSkills(prev => new Set([...prev, skillName]));
    addSkill({ skill_name: skillName });
    form.reset();
    setShowCustomSkillForm(false);
  };

  const handleContinue = async () => {
    await completeProfileAndMatch();
  };

  const handleBack = () => router.push('/experience');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col bg-white"
    >
      <div className="px-8 pt-8 pb-4 border-b">
        <h1 className="text-[22px] font-semibold text-gray-900">
          Professional Skills
        </h1>
        <p className="text-gray-600 text-base mt-1">
          Search and select your professional skills or add custom ones.
        </p>
      </div>

      <ScrollArea className="flex-1 px-8 py-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategory === null ? 'default' : 'neutral'}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              All Categories
            </Button>
            {skillsData.categories.map(category => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? 'default' : 'neutral'
                }
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
              >
                {category.name}
              </Button>
            ))}
          </div>

          <Command className="rounded-xl border shadow-sm bg-white">
            <div className="border-b px-3 py-2">
              <CommandInput
                placeholder="Search skills (e.g. React, Python, JavaScript)..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="border-0 text-base"
              />
            </div>

            <CommandList>
              {skillsData.categories
                .filter(
                  category =>
                    !selectedCategory || category.id === selectedCategory,
                )
                .map(category => (
                  <CommandGroup
                    key={category.id}
                    heading={category.name}
                    className="px-2 py-1.5"
                  >
                    {category.skills
                      .filter(skill =>
                        skill.toLowerCase().includes(searchQuery.toLowerCase()),
                      )
                      .map(skill => (
                        <CommandItem
                          key={skill}
                          onSelect={() => handleSkillToggle(skill)}
                          className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50 transition"
                        >
                          <span className="flex-1 text-sm">{skill}</span>
                          {selectedSkills.has(skill) ? (
                            <Check className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Plus className="w-4 h-4 text-gray-400" />
                          )}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                ))}
            </CommandList>
          </Command>

          {showCustomSkillForm ? (
            <motion.form
              onSubmit={handleAddCustomSkill}
              className="mt-3 flex gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Input
                type="text"
                name="skill_name"
                placeholder="Enter a custom skill..."
                className="h-9"
                autoFocus
              />
              <Button type="submit" size="sm" className="h-9">
                Add
              </Button>
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => setShowCustomSkillForm(false)}
                className="h-9"
              >
                Cancel
              </Button>
            </motion.form>
          ) : (
            <Button
              type="button"
              variant="neutral"
              onClick={() => setShowCustomSkillForm(true)}
              className="w-full h-9 border-dashed hover:bg-gray-50/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Skill
            </Button>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Selected Skills ({selectedSkills.size})
            </h3>
            {selectedSkills.size > 0 ? (
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedSkills).map(skill => (
                  <Button
                    key={skill}
                    variant="neutral"
                    size="sm"
                    onClick={() => handleSkillToggle(skill)}
                    className="bg-white hover:bg-gray-100 transition-colors"
                  >
                    {skill}
                    <X className="w-4 h-4 ml-2 text-gray-500" />
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No skills selected. Choose skills from the list above or add a
                custom skill.
              </p>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between px-8 py-4 border-t">
        <Button onClick={handleBack} variant="neutral" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={
            !skills.length ||
            saving ||
            completionStatus === 'generating' ||
            completionStatus === 'matching'
          }
          size="sm"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : completionStatus === 'generating' ||
            completionStatus === 'matching' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {completionStatus === 'generating'
                ? 'Processing...'
                : `Finding Jobs...`}
            </>
          ) : completionStatus === 'completed' ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              {matchesFound} Matches Found!
            </>
          ) : (
            <>
              Finish <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
