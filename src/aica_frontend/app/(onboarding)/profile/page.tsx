'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, User, MapPin, Phone, Linkedin } from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { UserProfile } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, updateProfile, loadResumeData, loading, saving } =
    useResumeBuilder();
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: '',
    phone: '',
    location: '',
    linkedin_url: '',
  });

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        linkedin_url: profile.linkedin_url || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    router.push('/education');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      <div className="p-8">
        <div className="space-y-6 mb-8">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              Let&apos;s get to know you
            </h1>
            <p className="text-gray-600 text-base mt-1">
              Start by filling in your basic profile details — our AI will use
              this info to build your resume.
            </p>
          </div>

          <div className="h-[1px] bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-5">
            <div>
              <Label
                htmlFor="full_name"
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <User className="w-4 h-4 text-gray-400" /> Full Name *
              </Label>
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name || ''}
                onChange={e => handleInputChange('full_name', e.target.value)}
                required
                className="mt-1.5 h-10"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="phone"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <Phone className="w-4 h-4 text-gray-400" /> Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone || ''}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className="mt-1.5 h-10"
                />
              </div>

              <div>
                <Label
                  htmlFor="location"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <MapPin className="w-4 h-4 text-gray-400" /> Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="New York, NY"
                  value={formData.location || ''}
                  onChange={e => handleInputChange('location', e.target.value)}
                  className="mt-1.5 h-10"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="linkedin_url"
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <Linkedin className="w-4 h-4 text-gray-400" /> LinkedIn
              </Label>
              <Input
                id="linkedin_url"
                type="url"
                placeholder="https://linkedin.com/in/johndoe"
                value={formData.linkedin_url || ''}
                onChange={e =>
                  handleInputChange('linkedin_url', e.target.value)
                }
                className="mt-1.5 h-10"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto md:min-w-[120px] h-10"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
