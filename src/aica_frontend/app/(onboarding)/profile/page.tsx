'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight, User, MapPin, Phone, Mail } from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { UserProfile } from '@/types/user';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, updateProfile, loadResumeData, loading, saving } = useResumeBuilder();
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

  const handleSkip = () => {
    router.push('/education');
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
          <User className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Tell us about yourself
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Start building your professional profile with our AI-powered career assistant
        </p>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-3">
            <label htmlFor="full_name" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <User className="w-4 h-4" />
              Full Name *
            </label>
            <input
              id="full_name"
              type="text"
              placeholder="John Doe"
              value={formData.full_name || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('full_name', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Contact Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="location" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="New York, NY"
                value={formData.location || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* LinkedIn URL */}
          <div className="space-y-3">
            <label htmlFor="linkedin_url" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Mail className="w-4 h-4" />
              LinkedIn URL
            </label>
            <input
              id="linkedin_url"
              type="url"
              placeholder="https://linkedin.com/in/johndoe"
              value={formData.linkedin_url || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('linkedin_url', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={handleSkip}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
