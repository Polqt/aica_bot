'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Tell us about yourself
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Start building your professional profile
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.full_name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('full_name', e.target.value)}
                  className="bg-white/50 dark:bg-slate-700/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                    className="bg-white/50 dark:bg-slate-700/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="New York, NY"
                    value={formData.location || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('location', e.target.value)}
                    className="bg-white/50 dark:bg-slate-700/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  LinkedIn URL
                </Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  placeholder="https://linkedin.com/in/johndoe"
                  value={formData.linkedin_url || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('linkedin_url', e.target.value)}
                  className="bg-white/50 dark:bg-slate-700/50"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="neutral"
                  onClick={handleSkip}
                  className="flex-1"
                  disabled={saving}
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
