'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { UserProfile } from '@/types/user';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Shield,
  Bell,
  FileText,
  Upload,
  Download,
  Settings,
  Star,
  Target,
  TrendingUp,
  MapPin,
  Briefcase,
  Award,
  Phone,
} from 'lucide-react';

// Mock data for demonstration
const mockUserData = {
  id: '1',
  email: 'john.doe@email.com',
  created_at: '2024-01-15T00:00:00Z',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  bio: 'Passionate frontend developer with 8+ years of experience building scalable web applications. I love creating intuitive user interfaces and working with modern technologies.',
  skills: [
    'React',
    'TypeScript',
    'Next.js',
    'Node.js',
    'Python',
    'AWS',
    'GraphQL',
    'Tailwind CSS',
  ],
  experience:
    'Senior Frontend Developer at TechCorp Inc. (2021-Present): Lead frontend development for enterprise applications serving 100k+ users. Frontend Developer at StartupXYZ (2019-2021): Built responsive web applications and improved user experience metrics by 40%.',
  company: 'TechCorp Inc.',
  resume_uploaded: true,
};

export default function UserProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setTimeout(() => {
          setUser(mockUserData);
          setLoading(false);
        }, 1000);

      } catch {
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Loading Profile
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Please wait while we fetch your information...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Error
            </h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No Profile Found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Unable to load user profile data
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fullName =
    `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
  const profileCompleteness = calculateProfileCompleteness(user);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <User className="w-8 h-8 text-violet-600" />
            Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your professional information and preferences
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Resume
          </Button>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Profile Views
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  156
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Applications
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  12
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Skill Matches
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {user.skills?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Completeness
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {profileCompleteness}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Basic Info */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <User className="w-5 h-5 text-violet-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {user.first_name?.charAt(0)?.toUpperCase() ||
                      user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          defaultValue={user.first_name || ''}
                          className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          defaultValue={user.last_name || ''}
                          className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          placeholder="Last Name"
                        />
                      </div>
                      <input
                        type="text"
                        defaultValue={user.company || ''}
                        className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                        placeholder="Current Company"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {fullName}
                      </h2>
                      <p className="text-violet-600 dark:text-violet-400 font-medium">
                        {user.company || 'Software Developer'}
                      </p>
                      <div className="flex items-center text-slate-600 dark:text-slate-400 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.location || 'Not specified'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <p className="text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-700/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={user.phone || ''}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                      placeholder="Phone Number"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-700/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
                      {user.phone || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={user.location || ''}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                      placeholder="City, State"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-700/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
                      {user.location || 'Not specified'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Member Since
                  </label>
                  <p className="text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-700/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : 'January 2024'}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  About
                </label>
                {isEditing ? (
                  <textarea
                    defaultValue={user.bio || ''}
                    rows={4}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-700/50 backdrop-blur-sm p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                    {user.bio ||
                      'No bio provided yet. Add some information about yourself!'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Award className="w-5 h-5 text-violet-600" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(user.skills || []).map((skill: string, index: number) => (
                  <Badge
                    key={index}
                    className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
                {(!user.skills || user.skills.length === 0) && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No skills added yet
                  </p>
                )}
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/50 dark:bg-slate-700/50 border-dashed"
                  >
                    + Add Skill
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Briefcase className="w-5 h-5 text-violet-600" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea
                  defaultValue={user.experience || ''}
                  rows={6}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  placeholder="Describe your work experience..."
                />
              ) : (
                <div className="p-4 bg-slate-50/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {user.experience ||
                      'No experience information provided yet.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Resume Upload */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText className="w-5 h-5 text-violet-600" />
                Resume
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Keep your resume up to date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.resume_uploaded ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-emerald-600 mr-2" />
                      <span className="text-sm text-emerald-700 dark:text-emerald-300">
                        Resume uploaded
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/50 dark:bg-emerald-800/50"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Drop your resume here or click to upload
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/50 dark:bg-slate-700/50"
                  >
                    Choose File
                  </Button>
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Supported formats: PDF, DOC, DOCX (Max 5MB)
              </p>
            </CardContent>
          </Card>

          {/* Profile Completeness */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Profile Strength
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Completeness
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {profileCompleteness}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompleteness}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span
                    className={`${
                      user.first_name && user.last_name
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    Full name
                  </span>
                  <span>{user.first_name && user.last_name ? '✓' : '○'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`${
                      user.bio ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  >
                    Bio
                  </span>
                  <span>{user.bio ? '✓' : '○'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`${
                      user.skills && user.skills.length > 0
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    Skills
                  </span>
                  <span>
                    {user.skills && user.skills.length > 0 ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`${
                      user.experience ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  >
                    Experience
                  </span>
                  <span>{user.experience ? '✓' : '○'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`${
                      user.resume_uploaded
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    Resume
                  </span>
                  <span>{user.resume_uploaded ? '✓' : '○'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700"
              >
                <Settings className="w-4 h-4 mr-3" />
                Account Settings
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700"
              >
                <Bell className="w-4 h-4 mr-3" />
                Notifications
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700"
              >
                <Shield className="w-4 h-4 mr-3" />
                Privacy
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function calculateProfileCompleteness(user: UserProfile): number {
  let completedFields = 0;
  const totalFields = 7;

  if (user.first_name && user.last_name) completedFields++;
  if (user.email) completedFields++;
  if (user.bio) completedFields++;
  if (user.skills && user.skills.length > 0) completedFields++;
  if (user.experience) completedFields++;
  if (user.location) completedFields++;
  if (user.resume_uploaded) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
}
