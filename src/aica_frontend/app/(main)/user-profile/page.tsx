'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  Edit,
  Download,
  Upload,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

const userProfile = {
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  bio: 'Passionate full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies. Always eager to learn new technologies and tackle challenging problems.',
  avatar: '/api/placeholder/150/150',
  joinDate: 'January 2024',
  skills: [
    { name: 'React', level: 'Expert', color: 'bg-blue-600' },
    { name: 'TypeScript', level: 'Expert', color: 'bg-blue-500' },
    { name: 'Node.js', level: 'Advanced', color: 'bg-green-600' },
    { name: 'Python', level: 'Intermediate', color: 'bg-yellow-600' },
    { name: 'AWS', level: 'Advanced', color: 'bg-orange-600' },
    { name: 'Docker', level: 'Intermediate', color: 'bg-blue-700' },
  ],
  experience: [
    {
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      period: '2022 - Present',
      description: 'Led development of customer-facing applications serving 100K+ users. Implemented modern React architecture and improved performance by 40%.',
    },
    {
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      period: '2020 - 2022',
      description: 'Built and maintained multiple web applications using MERN stack. Collaborated with cross-functional teams in agile environment.',
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      period: '2016 - 2020',
      gpa: '3.8/4.0',
    },
  ],
  certifications: [
    { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023' },
    { name: 'React Developer Certification', issuer: 'Meta', date: '2022' },
  ],
  stats: {
    profileViews: 156,
    applicationsSent: 24,
    interviewsScheduled: 8,
    offersReceived: 3,
  },
};

export default function UserProfilePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute -left-4 top-0 w-3 h-full bg-violet-600 transform -skew-x-12" />
        <div className="pl-8">
          <h1 className="text-4xl lg:text-6xl font-black text-black uppercase tracking-wide flex items-center gap-4 mb-2">
            <div className="bg-violet-600 text-white p-3 border-4 border-black shadow-[6px_6px_0px_0px_black]">
              <User className="w-8 h-8" />
            </div>
            USER PROFILE
          </h1>
          <p className="text-gray-700 font-black text-lg uppercase tracking-wide">
            MANAGE YOUR PROFESSIONAL INFORMATION AND SKILLS
          </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          asChild
          className="bg-black text-white border-4 border-black hover:bg-violet-600 hover:text-white font-black uppercase tracking-wide px-6 py-4 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200"
        >
          <Link href="/user-profile/edit">
            <Edit className="w-5 h-5 mr-3" />
            EDIT PROFILE
          </Link>
        </Button>
        <Button
          className="bg-violet-600 text-white border-4 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide px-6 py-4 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200"
        >
          <Download className="w-5 h-5 mr-3" />
          DOWNLOAD CV
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Basic Info Card */}
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
            <CardHeader className="border-b-4 border-black pb-6 bg-violet-50">
              <CardTitle className="text-2xl font-black text-black uppercase tracking-wide">
                BASIC INFORMATION
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-violet-600 border-4 border-black rounded-2xl flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_black]">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-black text-black uppercase tracking-wide mb-2">
                  {userProfile.name}
                </h2>
                <p className="text-gray-700 font-black text-lg uppercase">
                  FULL STACK DEVELOPER
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-violet-50 border-2 border-black rounded-lg">
                  <Mail className="w-6 h-6 text-violet-600 flex-shrink-0" />
                  <span className="font-black text-gray-700 uppercase text-sm">
                    {userProfile.email}
                  </span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-violet-50 border-2 border-black rounded-lg">
                  <Phone className="w-6 h-6 text-violet-600 flex-shrink-0" />
                  <span className="font-black text-gray-700 uppercase text-sm">
                    {userProfile.phone}
                  </span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-violet-50 border-2 border-black rounded-lg">
                  <MapPin className="w-6 h-6 text-violet-600 flex-shrink-0" />
                  <span className="font-black text-gray-700 uppercase text-sm">
                    {userProfile.location}
                  </span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-violet-50 border-2 border-black rounded-lg">
                  <Calendar className="w-6 h-6 text-violet-600 flex-shrink-0" />
                  <span className="font-black text-gray-700 uppercase text-sm">
                    JOINED {userProfile.joinDate}
                  </span>
                </div>
              </div>

              <div className="bg-white border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
                <p className="text-gray-700 font-black text-sm leading-relaxed uppercase tracking-wide">
                  {userProfile.bio}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-violet-50 border-4 border-black shadow-[8px_8px_0px_0px_black]">
            <CardHeader className="border-b-4 border-black pb-6">
              <CardTitle className="text-xl font-black text-black uppercase tracking-wide">
                ACTIVITY STATS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                  <div className="text-3xl font-black text-black mb-2">
                    {userProfile.stats.profileViews}
                  </div>
                  <div className="text-sm font-black text-gray-700 uppercase">
                    PROFILE VIEWS
                  </div>
                </div>
                <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                  <div className="text-3xl font-black text-violet-600 mb-2">
                    {userProfile.stats.applicationsSent}
                  </div>
                  <div className="text-sm font-black text-gray-700 uppercase">
                    APPLICATIONS
                  </div>
                </div>
                <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                  <div className="text-3xl font-black text-green-600 mb-2">
                    {userProfile.stats.interviewsScheduled}
                  </div>
                  <div className="text-sm font-black text-gray-700 uppercase">
                    INTERVIEWS
                  </div>
                </div>
                <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                  <div className="text-3xl font-black text-yellow-600 mb-2">
                    {userProfile.stats.offersReceived}
                  </div>
                  <div className="text-sm font-black text-gray-700 uppercase">
                    OFFERS
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
            <CardHeader className="border-b-4 border-black pb-6 bg-violet-50">
              <CardTitle className="text-xl font-black text-black uppercase tracking-wide">
                QUICK ACTIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button className="w-full bg-black text-white border-4 border-black hover:bg-violet-600 hover:text-white font-black uppercase py-4 shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200">
                <Upload className="w-5 h-5 mr-3" />
                UPLOAD RESUME
              </Button>
              <Button className="w-full bg-violet-600 text-white border-4 border-black hover:bg-black hover:text-white font-black uppercase py-4 shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200">
                <Settings className="w-5 h-5 mr-3" />
                ACCOUNT SETTINGS
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Skills Section */}
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
            <CardHeader className="border-b-4 border-black pb-6 bg-violet-50">
              <CardTitle className="text-2xl font-black text-black uppercase tracking-wide flex items-center gap-4">
                <div className="bg-black text-white p-2 border-2 border-black">
                  <Code className="w-6 h-6" />
                </div>
                TECHNICAL SKILLS
              </CardTitle>
              <CardDescription className="text-gray-700 font-black text-lg uppercase">
                YOUR PROGRAMMING AND TECHNICAL PROFICIENCIES
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userProfile.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-violet-50 border-4 border-black rounded-xl p-6 hover:shadow-[8px_8px_0px_0px_black] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-black uppercase tracking-wide text-lg">
                        {skill.name}
                      </h3>
                      <Badge className={`${skill.color} text-white border-2 border-black font-black uppercase px-3 py-1 shadow-[4px_4px_0px_0px_black]`}>
                        {skill.level}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 border-2 border-black rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          skill.level === 'Expert' ? 'bg-violet-600' :
                          skill.level === 'Advanced' ? 'bg-violet-500' :
                          'bg-violet-400'
                        }`}
                        style={{
                          width: skill.level === 'Expert' ? '90%' :
                                 skill.level === 'Advanced' ? '75%' :
                                 '60%'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience Section */}
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
            <CardHeader className="border-b-4 border-black pb-6 bg-violet-50">
              <CardTitle className="text-2xl font-black text-black uppercase tracking-wide flex items-center gap-4">
                <div className="bg-black text-white p-2 border-2 border-black">
                  <Briefcase className="w-6 h-6" />
                </div>
                WORK EXPERIENCE
              </CardTitle>
              <CardDescription className="text-gray-700 font-black text-lg uppercase">
                YOUR PROFESSIONAL JOURNEY AND ACHIEVEMENTS
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {userProfile.experience.map((exp, index) => (
                <div
                  key={index}
                  className="relative border-l-4 border-violet-600 pl-8 pb-8 last:pb-0"
                >
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-violet-600 border-4 border-black rounded-full"></div>
                  <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-black text-black uppercase tracking-wide mb-2">
                          {exp.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-gray-700 font-black uppercase text-sm">
                          <span className="flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-black" />
                            {exp.company}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-black" />
                            {exp.location}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-black" />
                            {exp.period}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 font-black leading-relaxed text-sm">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
            <CardHeader className="border-b-4 border-black pb-6 bg-violet-50">
              <CardTitle className="text-2xl font-black text-black uppercase tracking-wide flex items-center gap-4">
                <div className="bg-black text-white p-2 border-2 border-black">
                  <GraduationCap className="w-6 h-6" />
                </div>
                EDUCATION
              </CardTitle>
              <CardDescription className="text-gray-700 font-black text-lg uppercase">
                YOUR ACADEMIC BACKGROUND AND QUALIFICATIONS
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {userProfile.education.map((edu, index) => (
                <div
                  key={index}
                  className="bg-violet-50 border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_black]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-black text-black uppercase tracking-wide mb-3">
                        {edu.degree}
                      </h3>
                      <div className="space-y-2 text-gray-700 font-black uppercase text-sm">
                        <div className="flex items-center">
                          <GraduationCap className="w-5 h-5 mr-3 text-black" />
                          {edu.school}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 mr-3 text-black" />
                          {edu.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 mr-3 text-black" />
                          {edu.period}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white border-4 border-black font-black uppercase px-4 py-2 shadow-[4px_4px_0px_0px_black]">
                      GPA: {edu.gpa}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certifications Section */}
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
            <CardHeader className="border-b-4 border-black pb-6 bg-violet-50">
              <CardTitle className="text-2xl font-black text-black uppercase tracking-wide flex items-center gap-4">
                <div className="bg-black text-white p-2 border-2 border-black">
                  <Award className="w-6 h-6" />
                </div>
                CERTIFICATIONS
              </CardTitle>
              <CardDescription className="text-gray-700 font-black text-lg uppercase">
                YOUR PROFESSIONAL CERTIFICATIONS AND CREDENTIALS
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4">
                {userProfile.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-violet-50 border-4 border-black rounded-xl p-6 hover:shadow-[8px_8px_0px_0px_black] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-violet-600 border-4 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_black]">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-black uppercase tracking-wide text-lg">
                          {cert.name}
                        </h3>
                        <p className="text-gray-700 font-black uppercase text-sm">
                          {cert.issuer} • {cert.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}