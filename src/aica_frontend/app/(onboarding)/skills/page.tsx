'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Plus, X, Save } from 'lucide-react';
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
import { PageLoader } from '@/components/PageLoader';

export default function SkillsPage() {
  const router = useRouter();
  const { skills, bulkUpdateSkills, loadResumeData, loading, saving } =
    useResumeBuilder();
  const {
    status: completionStatus,
    matchesFound,
    completeProfileAndMatch,
  } = useProfileCompletion();
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [pendingSkills, setPendingSkills] = useState<Set<string>>(new Set());
  const [showCustomSkillForm, setShowCustomSkillForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  useEffect(() => {
    const existingSkillNames = new Set(skills.map(skill => skill.skill_name));
    setSelectedSkills(existingSkillNames);
    setPendingSkills(existingSkillNames);
  }, [skills]);

  const handleSkillToggle = (skillName: string) => {
    setPendingSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillName)) {
        newSet.delete(skillName);
      } else {
        newSet.add(skillName);
      }
      return newSet;
    });
    setHasChanges(true);
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const skillName = form.skill_name.value.trim();

    if (!skillName) {
      toast.error('Please enter a skill name');
      return;
    }
    setPendingSkills(prev => new Set([...prev, skillName]));
    setHasChanges(true);
    form.reset();
    setShowCustomSkillForm(false);
  };

  const handleSaveSkills = async () => {
    try {
      // Calculate which skills to add and remove
      const skillsToAdd = Array.from(pendingSkills).filter(
        skill => !selectedSkills.has(skill),
      );
      const skillIdsToDelete = skills
        .filter(skill => !pendingSkills.has(skill.skill_name))
        .map(skill => skill.id);

      // Only call API if there are changes
      if (skillsToAdd.length > 0 || skillIdsToDelete.length > 0) {
        await bulkUpdateSkills({
          skills_to_add: skillsToAdd.map(skill => ({ skill_name: skill })),
          skill_ids_to_delete: skillIdsToDelete,
        });

        // Update selectedSkills after successful save
        setSelectedSkills(pendingSkills);
        setHasChanges(false);
      } else {
        toast.info('No changes to save');
      }
    } catch (error) {
      console.error('Failed to save skills:', error);
    }
  };

  const handleContinue = async () => {
    await completeProfileAndMatch();
  };

  const handleBack = () => router.push('/experience');

  if (loading) {
    return <PageLoader text="Loading skills..." size="md" />;
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
              className={
                selectedCategory === null
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm ring-2 ring-blue-600 ring-offset-1'
                  : ''
              }
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
                className={
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm ring-2 ring-blue-600 ring-offset-1'
                    : ''
                }
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
                          {pendingSkills.has(skill) ? (
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
              Selected Skills ({pendingSkills.size})
            </h3>
            {pendingSkills.size > 0 ? (
              <div className="flex flex-wrap gap-2">
                {Array.from(pendingSkills).map(skill => (
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

          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between"
            >
              <p className="text-sm text-blue-800">
                You have unsaved changes to your skills.
              </p>
              <Button
                onClick={handleSaveSkills}
                disabled={saving}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between px-8 py-4 border-t">
        <Button onClick={handleBack} variant="neutral" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={
            !selectedSkills.size ||
            hasChanges ||
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
          ) : hasChanges ? (
            <>Please Save Changes</>
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
