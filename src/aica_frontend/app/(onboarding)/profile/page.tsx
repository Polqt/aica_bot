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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="p-12"
    >
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-600/25">
          <User className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6">
          TELL US ABOUT YOURSELF
        </h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 font-bold max-w-2xl mx-auto">
          START BUILDING YOUR PROFESSIONAL PROFILE WITH OUR AI-POWERED CAREER ASSISTANT
        </p>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Full Name */}
          <div className="bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-3xl p-8 border-4 border-black shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500 border-4 border-black rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-black uppercase tracking-wide">
                FULL NAME *
              </h3>
            </div>
            <input
              id="full_name"
              type="text"
              placeholder="JOHN DOE"
              value={formData.full_name || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('full_name', e.target.value)}
              required
              className="w-full p-6 text-2xl font-black bg-white border-4 border-black uppercase placeholder:text-gray-500 focus:outline-none focus:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          {/* Contact Info Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-blue-200 to-cyan-200 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border-4 border-black shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-500 border-4 border-black rounded-2xl flex items-center justify-center shadow-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-black uppercase tracking-wide">
                  PHONE NUMBER
                </h3>
              </div>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                className="w-full p-6 text-2xl font-black bg-white border-4 border-black placeholder:text-gray-500 focus:outline-none focus:bg-blue-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div className="bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-8 border-4 border-black shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-500 border-4 border-black rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-black uppercase tracking-wide">
                  LOCATION
                </h3>
              </div>
              <input
                id="location"
                type="text"
                placeholder="NEW YORK, NY"
                value={formData.location || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('location', e.target.value)}
                className="w-full p-6 text-2xl font-black bg-white border-4 border-black uppercase placeholder:text-gray-500 focus:outline-none focus:bg-green-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          </div>

          {/* LinkedIn URL */}
          <div className="bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 border-4 border-black shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-500 border-4 border-black rounded-2xl flex items-center justify-center shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-black uppercase tracking-wide">
                LINKEDIN URL
              </h3>
            </div>
            <input
              id="linkedin_url"
              type="url"
              placeholder="HTTPS://LINKEDIN.COM/IN/JOHNDOE"
              value={formData.linkedin_url || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('linkedin_url', e.target.value)}
              className="w-full p-6 text-2xl font-black bg-white border-4 border-black placeholder:text-gray-500 focus:outline-none focus:bg-purple-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-8 pt-8">
            <button
              type="button"
              onClick={handleSkip}
              disabled={saving}
              className="flex-1 bg-gray-400 border-4 border-black p-8 font-black text-2xl text-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50"
            >
              SKIP FOR NOW
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border-4 border-black p-8 font-black text-2xl text-white uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-4"
            >
              {saving ? (
                <>
                  <div className="w-8 h-8 bg-white border-4 border-black animate-spin"></div>
                  SAVING...
                </>
              ) : (
                <>
                  CONTINUE
                  <ArrowRight className="w-8 h-8" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
