'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ResumeReuploadModal from '@/components/ResumeReuploadModal';
import SkillsEditorModal from '@/components/SkillsEditorModal';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  GraduationCap,
  Briefcase,
  Code,
  Upload,
  Edit2,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { PageLoader } from '@/components/PageLoader';

export default function UserProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, education, experience, skills, loading, loadResumeData } =
    useResumeBuilder();
  const [mounted, setMounted] = useState(false);
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadResumeData();

    // Check if redirected from upload page after resume replacement
    const fromUpload = searchParams.get('from');
    if (fromUpload === 'upload') {
      setShowUploadSuccess(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setShowUploadSuccess(false), 5000);
    }
  }, [loadResumeData, searchParams]);

  if (!mounted || loading) {
    return <PageLoader text="Loading profile..." size="md" />;
  }

  // Group skills by proficiency level (since skill_category doesn't exist in type)
  const skillsByProficiency = skills.reduce((acc, skill) => {
    const level = skill.proficiency_level || 'beginner';
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  const handleUploadClick = () => {
    // If user has existing data, show modal. Otherwise go directly to upload
    if (
      skills.length > 0 ||
      experience.length > 0 ||
      education.length > 0 ||
      profile?.resume_uploaded
    ) {
      setShowReuploadModal(true);
    } else {
      router.push('/upload');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Success Banner after Resume Upload */}
      {showUploadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900 mb-1">
                Resume updated successfully!
              </h3>
              <p className="text-sm text-green-800 mb-3">
                Your profile has been refreshed with new information from your
                resume. New job matches have been generated based on your
                updated skills.
              </p>
              <Button
                onClick={() => {
                  setShowUploadSuccess(false);
                  router.push('/job-matches');
                }}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white border-0"
              >
                View Job Matches
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <button
              onClick={() => setShowUploadSuccess(false)}
              className="text-green-600 hover:text-green-800"
            >
              <span className="sr-only">Close</span>×
            </button>
          </div>
        </motion.div>
      )}

      {/* Resume Reupload Modal */}
      <ResumeReuploadModal
        isOpen={showReuploadModal}
        onClose={() => setShowReuploadModal(false)}
      />

      {/* Skills Editor Modal */}
      <SkillsEditorModal
        isOpen={showSkillsModal}
        onClose={() => {
          setShowSkillsModal(false);
          // Reload data to show updated skills
          loadResumeData();
        }}
      />

      {/* Header with Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your professional information
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleUploadClick}
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 bg-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Resume
          </Button>
          <Button
            onClick={() => router.push('/profile')}
            className="bg-gray-900 hover:bg-gray-800 text-white border-0"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </motion.div>

      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-gray-600" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    {profile?.full_name || 'Your Name'}
                  </h2>
                  <p className="text-base text-gray-500">
                    {experience[0]?.job_title || 'Your Position'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {profile?.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile?.linkedin_url && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Linkedin className="w-4 h-4 text-gray-400" />
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>

                {profile?.experience_years && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {profile.experience_years} years of experience
                    </Badge>
                    {profile.education_level && (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 border border-gray-200"
                      >
                        {profile.education_level}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skills Section */}
      {skills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Skills
                  </h3>
                </div>
                <Button
                  onClick={() => setShowSkillsModal(true)}
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 bg-transparent hover:bg-gray-50 border-0"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit Skills
                </Button>
              </div>

              <div className="space-y-6">
                {/* Display skills grouped by proficiency level */}
                {Object.entries(skillsByProficiency).map(
                  ([level, levelSkills]) => (
                    <div key={level}>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        {level === 'expert'
                          ? 'Expert Level'
                          : level === 'advanced'
                          ? 'Advanced'
                          : level === 'intermediate'
                          ? 'Intermediate'
                          : 'Beginner'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {levelSkills.map(skill => (
                          <Badge
                            key={skill.id}
                            variant="secondary"
                            className="px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            {skill.skill_name}
                            {skill.proficiency_level && (
                              <span className="ml-2 text-xs text-gray-500">
                                {skill.proficiency_level}
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Experience Section */}
      {experience.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Experience
                  </h3>
                </div>
                <Button
                  onClick={() => router.push('/experience')}
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 bg-transparent hover:bg-gray-50 border-0"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit Experience
                </Button>
              </div>

              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div
                    key={exp.id}
                    className={`${
                      index !== experience.length - 1
                        ? 'pb-6 border-b border-gray-100'
                        : ''
                    }`}
                  >
                    <div className="space-y-2">
                      <h4 className="text-base font-medium text-gray-900">
                        {exp.job_title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        {exp.company_name && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                            {exp.company_name}
                          </span>
                        )}
                        {(exp.start_date || exp.end_date) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {exp.start_date}
                            {exp.end_date ? ` - ${exp.end_date}` : ' - Present'}
                          </span>
                        )}
                      </div>
                      {exp.description && (
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Education
                  </h3>
                </div>
                <Button
                  onClick={() => router.push('/education')}
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 bg-transparent hover:bg-gray-50 border-0"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit Education
                </Button>
              </div>

              <div className="space-y-6">
                {education.map((edu, index) => (
                  <div
                    key={edu.id}
                    className={`${
                      index !== education.length - 1
                        ? 'pb-6 border-b border-gray-100'
                        : ''
                    }`}
                  >
                    <div className="space-y-2">
                      <h4 className="text-base font-medium text-gray-900">
                        {edu.degree_type}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        {edu.institution_name && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                            {edu.institution_name}
                          </span>
                        )}
                        {(edu.start_date || edu.end_date) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {edu.start_date}
                            {edu.end_date ? ` - ${edu.end_date}` : ' - Present'}
                          </span>
                        )}
                      </div>
                      {edu.field_of_study && (
                        <p className="text-sm text-gray-600">
                          Field of Study: {edu.field_of_study}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!profile?.full_name &&
        skills.length === 0 &&
        experience.length === 0 &&
        education.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No profile information yet
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload your resume or fill out your profile to get started
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => router.push('/upload')}
                      className="bg-gray-900 hover:bg-gray-800 text-white border-0"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Resume
                    </Button>
                    <Button
                      onClick={() => router.push('/profile')}
                      className="border border-gray-200 hover:bg-gray-50 bg-white text-gray-700"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Fill Profile Manually
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
    </div>
  );
}
