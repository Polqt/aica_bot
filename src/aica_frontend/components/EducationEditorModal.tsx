'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, GraduationCap, Loader2, Plus, Trash2 } from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { toast } from 'sonner';
import { UserEducationCreate } from '@/types/user';

interface EducationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EducationFormData extends UserEducationCreate {
  id?: string;
  isEditing?: boolean;
}

export default function EducationEditorModal({
  isOpen,
  onClose,
}: EducationEditorModalProps) {
  const {
    education,
    addEducation,
    updateEducation,
    deleteEducation,
    loadResumeData,
  } = useResumeBuilder();

  const [localEducation, setLocalEducation] = useState<EducationFormData[]>([]);
  const [originalEducation, setOriginalEducation] = useState<
    EducationFormData[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEducation, setNewEducation] = useState<EducationFormData>({
    institution_name: '',
    degree_type: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });

  // Load education data when modal opens
  useEffect(() => {
    if (isOpen) {
      const eduData = education.map(edu => ({
        id: edu.id,
        institution_name: edu.institution_name,
        degree_type: edu.degree_type,
        field_of_study: edu.field_of_study,
        start_date: edu.start_date,
        end_date: edu.end_date,
        is_current: edu.is_current,
      }));
      setLocalEducation(eduData);
      setOriginalEducation(JSON.parse(JSON.stringify(eduData)));
    }
  }, [isOpen, education]);

  const hasChanges =
    JSON.stringify(localEducation) !== JSON.stringify(originalEducation);

  const handleAddNew = () => {
    if (
      !newEducation.institution_name.trim() ||
      !newEducation.degree_type.trim() ||
      !newEducation.field_of_study.trim()
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!newEducation.start_date) {
      toast.error('Start date is required');
      return;
    }

    setLocalEducation(prev => [...prev, { ...newEducation, isEditing: true }]);
    setNewEducation({
      institution_name: '',
      degree_type: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      is_current: false,
    });
    setShowAddForm(false);
    toast.success('Education added to list');
  };

  const handleUpdateLocal = (
    index: number,
    field: keyof EducationFormData,
    value: string | boolean,
  ) => {
    setLocalEducation(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteLocal = (index: number) => {
    setLocalEducation(prev => prev.filter((_, i) => i !== index));
    toast.info('Education removed from list');
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);

    try {
      // Determine deletions
      const deletedIds = originalEducation
        .filter(orig => !localEducation.some(local => local.id === orig.id))
        .map(edu => edu.id)
        .filter((id): id is string => !!id);

      // Process deletions
      for (const id of deletedIds) {
        await deleteEducation(id);
      }

      // Process additions and updates
      for (const edu of localEducation) {
        const { id, isEditing, ...eduData } = edu;

        if (id && !isEditing) {
          // Existing entry - check if changed
          const original = originalEducation.find(o => o.id === id);
          if (
            JSON.stringify(eduData) !==
            JSON.stringify({
              institution_name: original?.institution_name,
              degree_type: original?.degree_type,
              field_of_study: original?.field_of_study,
              start_date: original?.start_date,
              end_date: original?.end_date,
              is_current: original?.is_current,
            })
          ) {
            await updateEducation(id, eduData);
          }
        } else if (!id || isEditing) {
          // New entry
          await addEducation(eduData);
        }
      }

      await loadResumeData();
      toast.success('Education updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving education:', error);
      toast.error('Failed to save education. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setLocalEducation(JSON.parse(JSON.stringify(originalEducation)));
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
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Edit Your Education
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Add, edit, or remove education entries
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Existing Education Entries */}
              {localEducation.map((edu, index) => (
                <Card
                  key={index}
                  className="p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {edu.isEditing ? 'New Entry' : 'Education Entry'}
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
                          Institution <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={edu.institution_name}
                          onChange={e =>
                            handleUpdateLocal(
                              index,
                              'institution_name',
                              e.target.value,
                            )
                          }
                          placeholder="University Name"
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Degree Type <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={edu.degree_type}
                          onChange={e =>
                            handleUpdateLocal(
                              index,
                              'degree_type',
                              e.target.value,
                            )
                          }
                          placeholder="Bachelor of Science"
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Field of Study <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={edu.field_of_study}
                          onChange={e =>
                            handleUpdateLocal(
                              index,
                              'field_of_study',
                              e.target.value,
                            )
                          }
                          placeholder="Computer Science"
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="month"
                          value={edu.start_date}
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
                          value={edu.end_date || ''}
                          onChange={e =>
                            handleUpdateLocal(index, 'end_date', e.target.value)
                          }
                          disabled={edu.is_current}
                          className="text-sm"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-7">
                        <input
                          type="checkbox"
                          id={`current-${index}`}
                          checked={edu.is_current}
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
                          Currently studying here
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Add New Form */}
              {showAddForm && (
                <Card className="p-4 border-2 border-dashed border-blue-300 bg-blue-50/30">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Add New Education
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Institution <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={newEducation.institution_name}
                          onChange={e =>
                            setNewEducation(prev => ({
                              ...prev,
                              institution_name: e.target.value,
                            }))
                          }
                          placeholder="University Name"
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Degree Type <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={newEducation.degree_type}
                          onChange={e =>
                            setNewEducation(prev => ({
                              ...prev,
                              degree_type: e.target.value,
                            }))
                          }
                          placeholder="Bachelor of Science"
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Field of Study <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={newEducation.field_of_study}
                          onChange={e =>
                            setNewEducation(prev => ({
                              ...prev,
                              field_of_study: e.target.value,
                            }))
                          }
                          placeholder="Computer Science"
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="month"
                          value={newEducation.start_date}
                          onChange={e =>
                            setNewEducation(prev => ({
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
                          value={newEducation.end_date || ''}
                          onChange={e =>
                            setNewEducation(prev => ({
                              ...prev,
                              end_date: e.target.value,
                            }))
                          }
                          disabled={newEducation.is_current}
                          className="text-sm"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-7">
                        <input
                          type="checkbox"
                          id="current-new"
                          checked={newEducation.is_current}
                          onChange={e => {
                            setNewEducation(prev => ({
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
                          Currently studying here
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="neutral"
                        size="sm"
                        onClick={() => {
                          setShowAddForm(false);
                          setNewEducation({
                            institution_name: '',
                            degree_type: '',
                            field_of_study: '',
                            start_date: '',
                            end_date: '',
                            is_current: false,
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
                  Add Education Entry
                </Button>
              )}

              {localEducation.length === 0 && !showAddForm && (
                <div className="text-center py-12 text-gray-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No education entries yet</p>
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
                  ? `${localEducation.length} entries in list`
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
