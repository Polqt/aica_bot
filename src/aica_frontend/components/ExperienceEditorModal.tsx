'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { X, Briefcase, Loader2, Plus, Trash2 } from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { toast } from 'sonner';
import { UserExperienceCreate } from '@/types/user';

interface ExperienceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExperienceFormData extends UserExperienceCreate {
  id?: string;
  isEditing?: boolean;
}

export default function ExperienceEditorModal({
  isOpen,
  onClose,
}: ExperienceEditorModalProps) {
  const {
    experience,
    addExperience,
    updateExperience,
    deleteExperience,
    loadResumeData,
  } = useResumeBuilder();

  const [localExperience, setLocalExperience] = useState<ExperienceFormData[]>(
    [],
  );
  const [originalExperience, setOriginalExperience] = useState<
    ExperienceFormData[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExperience, setNewExperience] = useState<ExperienceFormData>({
    company_name: '',
    job_title: '',
    employment_type: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
  });

  // Load experience data when modal opens
  useEffect(() => {
    if (isOpen) {
      const expData = experience.map(exp => ({
        id: exp.id,
        company_name: exp.company_name,
        job_title: exp.job_title,
        employment_type: exp.employment_type,
        start_date: exp.start_date,
        end_date: exp.end_date,
        is_current: exp.is_current,
        description: exp.description,
      }));
      setLocalExperience(expData);
      setOriginalExperience(JSON.parse(JSON.stringify(expData)));
    }
  }, [isOpen, experience]);

  const hasChanges =
    JSON.stringify(localExperience) !== JSON.stringify(originalExperience);

  const handleAddNew = () => {
    if (!newExperience.company_name.trim() || !newExperience.job_title.trim()) {
      toast.error('Company name and job title are required');
      return;
    }

    if (!newExperience.start_date) {
      toast.error('Start date is required');
      return;
    }

    setLocalExperience(prev => [
      ...prev,
      { ...newExperience, isEditing: true },
    ]);
    setNewExperience({
      company_name: '',
      job_title: '',
      employment_type: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
    });
    setShowAddForm(false);
    toast.success('Experience added to list');
  };

  const handleUpdateLocal = (
    index: number,
    field: keyof ExperienceFormData,
    value: string | boolean,
  ) => {
    setLocalExperience(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteLocal = (index: number) => {
    setLocalExperience(prev => prev.filter((_, i) => i !== index));
    toast.info('Experience removed from list');
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);

    try {
      // Determine deletions
      const deletedIds = originalExperience
        .filter(orig => !localExperience.some(local => local.id === orig.id))
        .map(exp => exp.id)
        .filter((id): id is string => !!id);

      // Process deletions
      for (const id of deletedIds) {
        await deleteExperience(id);
      }

      // Process additions and updates
      for (const exp of localExperience) {
        const { id, isEditing, ...expData } = exp;

        if (id && !isEditing) {
          // Existing entry - check if changed
          const original = originalExperience.find(o => o.id === id);
          const originalData = {
            company_name: original?.company_name,
            job_title: original?.job_title,
            employment_type: original?.employment_type,
            start_date: original?.start_date,
            end_date: original?.end_date,
            is_current: original?.is_current,
            description: original?.description,
          };
          if (JSON.stringify(expData) !== JSON.stringify(originalData)) {
            await updateExperience(id, expData);
          }
        } else if (!id || isEditing) {
          // New entry
          await addExperience(expData);
        }
      }

      await loadResumeData();
      toast.success('Experience updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving experience:', error);
      toast.error('Failed to save experience. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setLocalExperience(JSON.parse(JSON.stringify(originalExperience)));
      toast.info('Changes discarded');
    }
    setShowAddForm(false);
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
          onClick={handleCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-5 flex-shrink-0">
              <button
                onClick={handleCancel}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Edit Your Experience
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Add, edit, or remove work experience entries
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Existing Experience Entries */}
              {localExperience.map((exp, index) => (
                <Card
                  key={index}
                  className="p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {exp.isEditing ? 'New Entry' : 'Experience Entry'}
                      </h3>
                      <button
                        onClick={() => handleDeleteLocal(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Company Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={exp.company_name}
                          onChange={e =>
                            handleUpdateLocal(
                              index,
                              'company_name',
                              e.target.value,
                            )
                          }
                          placeholder="Google Inc."
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Job Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={exp.job_title}
                          onChange={e =>
                            handleUpdateLocal(
                              index,
                              'job_title',
                              e.target.value,
                            )
                          }
                          placeholder="Software Engineer"
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Employment Type
                        </Label>
                        <select
                          value={exp.employment_type}
                          onChange={e =>
                            handleUpdateLocal(
                              index,
                              'employment_type',
                              e.target.value,
                            )
                          }
                          className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="month"
                          value={exp.start_date}
                          onChange={e =>
                            handleUpdateLocal(
                              index,
                              'start_date',
                              e.target.value,
                            )
                          }
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          End Date
                        </Label>
                        <Input
                          type="month"
                          value={exp.end_date || ''}
                          onChange={e =>
                            handleUpdateLocal(index, 'end_date', e.target.value)
                          }
                          disabled={exp.is_current}
                          className="text-sm"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-7">
                        <input
                          type="checkbox"
                          id={`current-${index}`}
                          checked={exp.is_current}
                          onChange={e => {
                            handleUpdateLocal(
                              index,
                              'is_current',
                              e.target.checked,
                            );
                            if (e.target.checked) {
                              handleUpdateLocal(index, 'end_date', '');
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`current-${index}`}
                          className="text-sm text-gray-700"
                        >
                          Currently working here
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        value={exp.description || ''}
                        onChange={e =>
                          handleUpdateLocal(
                            index,
                            'description',
                            e.target.value,
                          )
                        }
                        placeholder="Describe your role and responsibilities..."
                        className="text-sm min-h-[100px]"
                        rows={4}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {/* Add New Form */}
              {showAddForm && (
                <Card className="p-4 border-2 border-dashed border-blue-300 bg-blue-50/30">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Add New Experience
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Company Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={newExperience.company_name}
                          onChange={e =>
                            setNewExperience(prev => ({
                              ...prev,
                              company_name: e.target.value,
                            }))
                          }
                          placeholder="Google Inc."
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Job Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={newExperience.job_title}
                          onChange={e =>
                            setNewExperience(prev => ({
                              ...prev,
                              job_title: e.target.value,
                            }))
                          }
                          placeholder="Software Engineer"
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Employment Type
                        </Label>
                        <select
                          value={newExperience.employment_type}
                          onChange={e =>
                            setNewExperience(prev => ({
                              ...prev,
                              employment_type: e.target.value,
                            }))
                          }
                          className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="month"
                          value={newExperience.start_date}
                          onChange={e =>
                            setNewExperience(prev => ({
                              ...prev,
                              start_date: e.target.value,
                            }))
                          }
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          End Date
                        </Label>
                        <Input
                          type="month"
                          value={newExperience.end_date || ''}
                          onChange={e =>
                            setNewExperience(prev => ({
                              ...prev,
                              end_date: e.target.value,
                            }))
                          }
                          disabled={newExperience.is_current}
                          className="text-sm"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-7">
                        <input
                          type="checkbox"
                          id="current-new"
                          checked={newExperience.is_current}
                          onChange={e => {
                            setNewExperience(prev => ({
                              ...prev,
                              is_current: e.target.checked,
                              end_date: e.target.checked ? '' : prev.end_date,
                            }));
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor="current-new"
                          className="text-sm text-gray-700"
                        >
                          Currently working here
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        value={newExperience.description || ''}
                        onChange={e =>
                          setNewExperience(prev => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe your role and responsibilities..."
                        className="text-sm min-h-[100px]"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="neutral"
                        size="sm"
                        onClick={() => {
                          setShowAddForm(false);
                          setNewExperience({
                            company_name: '',
                            job_title: '',
                            employment_type: '',
                            start_date: '',
                            end_date: '',
                            is_current: false,
                            description: '',
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddNew}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Add to List
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Add Button */}
              {!showAddForm && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="neutral"
                  className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience Entry
                </Button>
              )}

              {localExperience.length === 0 && !showAddForm && (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No experience entries yet</p>
                  <p className="text-xs mt-1">
                    Click the button above to add your first entry
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex-shrink-0">
              <p className="text-xs text-gray-500">
                {hasChanges
                  ? `${localExperience.length} entries in list`
                  : 'No changes made'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="neutral"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  disabled={!hasChanges || isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
