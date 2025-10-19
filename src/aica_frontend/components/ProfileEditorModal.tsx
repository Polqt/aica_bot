'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, User, Loader2 } from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { toast } from 'sonner';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileEditorModal({
  isOpen,
  onClose,
}: ProfileEditorModalProps) {
  const { profile, updateProfile, loadResumeData } = useResumeBuilder();

  // Local state for form data
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    linkedin_url: '',
    experience_years: 0,
    education_level: '',
  });

  const [originalData, setOriginalData] = useState(formData);
  const [isSaving, setIsSaving] = useState(false);

  // Load profile data when modal opens
  useEffect(() => {
    if (isOpen && profile) {
      const data = {
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        linkedin_url: profile.linkedin_url || '',
        experience_years: profile.experience_years || 0,
        education_level: profile.education_level || '',
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [isOpen, profile]);

  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number,
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    // Validate required fields
    if (!formData.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile(formData);
      await loadResumeData();

      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setFormData(originalData);
      toast.info('Changes discarded');
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
          onClick={handleCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden"
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
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Edit Your Profile
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Update your personal and professional information
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="full_name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={e =>
                      handleInputChange('full_name', e.target.value)
                    }
                    placeholder="John Doe"
                    className="w-full"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium text-gray-700"
                  >
                    Location
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={e =>
                      handleInputChange('location', e.target.value)
                    }
                    placeholder="San Francisco, CA"
                    className="w-full"
                  />
                </div>

                {/* LinkedIn URL */}
                <div className="space-y-2">
                  <Label
                    htmlFor="linkedin_url"
                    className="text-sm font-medium text-gray-700"
                  >
                    LinkedIn Profile URL
                  </Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={e =>
                      handleInputChange('linkedin_url', e.target.value)
                    }
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Years of Experience */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="experience_years"
                      className="text-sm font-medium text-gray-700"
                    >
                      Years of Experience
                    </Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experience_years}
                      onChange={e =>
                        handleInputChange(
                          'experience_years',
                          parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="5"
                      className="w-full"
                    />
                  </div>

                  {/* Education Level */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="education_level"
                      className="text-sm font-medium text-gray-700"
                    >
                      Education Level
                    </Label>
                    <select
                      id="education_level"
                      value={formData.education_level}
                      onChange={e =>
                        handleInputChange('education_level', e.target.value)
                      }
                      className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select level</option>
                      <option value="High School">High School</option>
                      <option value="Associate Degree">Associate Degree</option>
                      <option value="Bachelor Degree">Bachelor Degree</option>
                      <option value="Master Degree">Master Degree</option>
                      <option value="Doctoral Degree">Doctoral Degree</option>
                      <option value="Professional Degree">
                        Professional Degree
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex-shrink-0">
              <p className="text-xs text-gray-500">
                {hasChanges ? 'You have unsaved changes' : 'No changes made'}
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
