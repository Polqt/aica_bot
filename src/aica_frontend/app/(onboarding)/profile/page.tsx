'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, User, MapPin, Phone, Linkedin } from 'lucide-react';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { UserProfile } from '@/types/user';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-[85vh] flex flex-col justify-center"
    >
      <div className="max-w-2xl w-full mx-auto border rounded-2xl shadow-sm p-10">
        <div className="text-start mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Let’s get to know you
          </h1>
          <p className="text-gray-600 text-based max-w-md">
            Start by filling in your basic profile details — our AI will use
            this info to build your resume.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-2">
            <label
              htmlFor="full_name"
              className="flex items-center gap-2 text-sm font-semibold text-gray-800"
            >
              <User className="w-4 h-4 text-gray-500" /> Full Name *
            </label>
            <input
              id="full_name"
              type="text"
              placeholder="John Doe"
              value={formData.full_name || ''}
              onChange={e => handleInputChange('full_name', e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="flex items-center gap-2 text-sm font-semibold text-gray-800"
              >
                <Phone className="w-4 h-4 text-gray-500" /> Phone
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone || ''}
                onChange={e => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="location"
                className="flex items-center gap-2 text-sm font-semibold text-gray-800"
              >
                <MapPin className="w-4 h-4 text-gray-500" /> Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="New York, NY"
                value={formData.location || ''}
                onChange={e => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="linkedin_url"
              className="flex items-center gap-2 text-sm font-semibold text-gray-800"
            >
              <Linkedin className="w-4 h-4 text-gray-500" /> LinkedIn
            </label>
            <input
              id="linkedin_url"
              type="url"
              placeholder="https://linkedin.com/in/johndoe"
              value={formData.linkedin_url || ''}
              onChange={e => handleInputChange('linkedin_url', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
