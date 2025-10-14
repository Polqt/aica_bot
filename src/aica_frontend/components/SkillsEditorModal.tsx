'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus, Check, Search, Loader2 } from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { toast } from 'sonner';
import skillsData from '@/data/skills.json';

interface SkillsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SkillsEditorModal({
  isOpen,
  onClose,
}: SkillsEditorModalProps) {
  const { skills, addSkill, deleteSkill, saving, loadSkills } =
    useResumeBuilder();
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCustomSkillForm, setShowCustomSkillForm] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load skills when modal opens (always refresh to get latest data)
  useEffect(() => {
    if (isOpen) {
      setIsLoadingSkills(true);
      setHasChanges(false); // Reset changes flag
      loadSkills().finally(() => setIsLoadingSkills(false));
    }
  }, [isOpen, loadSkills]);

  // Sync selected skills with loaded skills
  useEffect(() => {
    const existingSkillNames = new Set(skills.map(skill => skill.skill_name));
    setSelectedSkills(existingSkillNames);
  }, [skills]);

  const handleSkillToggle = async (skillName: string) => {
    const isSelected = selectedSkills.has(skillName);

    if (isSelected) {
      const skillToDelete = skills.find(s => s.skill_name === skillName);
      if (skillToDelete) {
        try {
          await deleteSkill(skillToDelete.id);
          setSelectedSkills(prev => {
            const newSet = new Set(prev);
            newSet.delete(skillName);
            return newSet;
          });
          setHasChanges(true);
          toast.success(`Removed "${skillName}"`);
        } catch (error) {
          console.error('Failed to remove skill:', error);
          toast.error(`Failed to remove "${skillName}". Please try again.`);
        }
      }
    } else {
      // Add skill
      try {
        await addSkill({ skill_name: skillName });
        setSelectedSkills(prev => new Set([...prev, skillName]));
        setHasChanges(true);
        toast.success(`Added "${skillName}"`);
      } catch (error) {
        console.error('Failed to add skill:', error);
        toast.error(`Failed to add "${skillName}". Please try again.`);
      }
    }
  };

  const handleAddCustomSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillName = customSkillInput.trim();

    if (!skillName) {
      toast.error('Please enter a skill name');
      return;
    }

    if (selectedSkills.has(skillName)) {
      toast.error('This skill is already added');
      return;
    }

    try {
      await addSkill({ skill_name: skillName });
      setSelectedSkills(prev => new Set([...prev, skillName]));
      setHasChanges(true);
      toast.success(`Added "${skillName}"`);
      setCustomSkillInput('');
      setShowCustomSkillForm(false);
    } catch (error) {
      console.error('Failed to add custom skill:', error);
      toast.error(`Failed to add "${skillName}". Please try again.`);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setShowCustomSkillForm(false);
    setCustomSkillInput('');

    // Show confirmation toast if changes were made
    if (hasChanges) {
      toast.success('Your skills have been updated!', {
        description:
          'Job matches are being regenerated based on your new skills',
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-7xl h-[95vh] flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-5 flex-shrink-0">
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Edit Your Skills
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Add or remove skills from your profile
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Your Current Skills ({selectedSkills.size})
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Click on any skill below to remove it, or add new skills
                        from the list
                      </p>
                    </div>
                    {saving && (
                      <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="font-medium">Saving...</span>
                      </div>
                    )}
                  </div>

                  {isLoadingSkills ? (
                    <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-blue-200">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Loading your skills...
                      </p>
                    </div>
                  ) : selectedSkills.size > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
                      {Array.from(selectedSkills).map(skill => (
                        <motion.button
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => handleSkillToggle(skill)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-300 rounded-full text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all group shadow-sm"
                        >
                          <span className="text-gray-800 group-hover:text-red-700">
                            {skill}
                          </span>
                          <X className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-blue-200">
                      <p className="text-sm text-gray-600 font-medium">
                        No skills selected yet
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose from the list below or add custom skills
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      <Button
                        variant={
                          selectedCategory === null ? 'default' : 'neutral'
                        }
                        onClick={() => setSelectedCategory(null)}
                        size="sm"
                        className="text-xs whitespace-nowrap"
                      >
                        All Categories
                      </Button>
                      {skillsData.categories.map(category => (
                        <Button
                          key={category.id}
                          variant={
                            selectedCategory === category.id
                              ? 'default'
                              : 'neutral'
                          }
                          onClick={() => setSelectedCategory(category.id)}
                          size="sm"
                          className="text-xs whitespace-nowrap"
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search skills (e.g. React, Python, Communication)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Skills List - Clean layout without nested scrolling */}
                <div className="border border-gray-200 rounded-lg bg-white">
                  <div className="max-h-[calc(90vh-480px)] min-h-[280px] overflow-y-auto">
                    {skillsData.categories
                      .filter(
                        category =>
                          !selectedCategory || category.id === selectedCategory,
                      )
                      .map(category => {
                        const filteredSkills = category.skills.filter(skill =>
                          skill
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                        );

                        if (filteredSkills.length === 0) return null;

                        return (
                          <div
                            key={category.id}
                            className="border-b border-gray-100 last:border-b-0"
                          >
                            <div className="px-4 py-2 bg-gray-50/50 sticky top-0">
                              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                {category.name}
                              </h3>
                            </div>
                            <div className="px-2 py-2 space-y-1">
                              {filteredSkills.map(skill => (
                                <button
                                  key={skill}
                                  onClick={() => handleSkillToggle(skill)}
                                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors group"
                                >
                                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                    {skill}
                                  </span>
                                  {selectedSkills.has(skill) ? (
                                    <div className="flex items-center gap-1.5 text-blue-600">
                                      <Check className="w-4 h-4" />
                                      <span className="text-xs font-medium">
                                        Added
                                      </span>
                                    </div>
                                  ) : (
                                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Custom Skill Form */}
                {showCustomSkillForm ? (
                  <motion.form
                    onSubmit={handleAddCustomSkill}
                    className="flex gap-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Input
                      type="text"
                      value={customSkillInput}
                      onChange={e => setCustomSkillInput(e.target.value)}
                      placeholder="Enter a custom skill..."
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={saving || !customSkillInput.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={() => {
                        setShowCustomSkillForm(false);
                        setCustomSkillInput('');
                      }}
                    >
                      Cancel
                    </Button>
                  </motion.form>
                ) : (
                  <Button
                    type="button"
                    variant="neutral"
                    onClick={() => setShowCustomSkillForm(true)}
                    className="w-full border-dashed border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Skill
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex-shrink-0">
              <p className="text-xs text-gray-500">
                Changes are saved automatically
              </p>
              <Button
                onClick={handleClose}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Done
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
