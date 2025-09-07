// Shared data constants for the AICA application
// This file centralizes all content that appears across multiple pages

import {
  Target,
  Zap,
  TrendingUp,
  Users,
  GraduationCap,
  Brain,
  BookOpen,
  Sparkles,
} from 'lucide-react';

// Features from main page
export const features = [
  {
    icon: Target,
    title: "AI-Powered Matching",
    description: "Advanced algorithms analyze your resume and match you with the perfect job opportunities in real-time."
  },
  {
    icon: Zap,
    title: "Instant Insights",
    description: "Get immediate feedback on your resume's strengths and areas for improvement with AI analysis."
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    description: "Track your job search progress and receive personalized recommendations for career advancement."
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Connect with fellow job seekers and industry professionals in our supportive community."
  }
];

// Stats from main page
export const stats = [
  { value: "98%", label: "Match Accuracy" },
  { value: "2.5x", label: "Faster Hiring" },
  { value: "1000+", label: "Job Listings" },
  { value: "500+", label: "Happy Users" }
];

// Team data from about page
export const team = [
  { name: 'Heidine Marie Mahandog', role: 'Developer' },
  { name: 'Nathania Elouise Santia', role: 'Project Manager' },
  { name: 'Janpol Hidalgo', role: 'Developer' },
  { name: 'April Faith Gamboa', role: 'Researcher' },
];

// Mentors from about page
export const mentors = [
  'Julian Diego Mapa - Thesis Adviser',
  'Dr. Eddie de Paula - Thesis Co-Adviser',
  'Dr. Eischeid Arcenal - AI Expert',
];

// App metadata
export const appInfo = {
  name: "AICA",
  fullName: "AI-powered Career Assistant",
  description: "AI-powered job matching platform designed specifically for tech graduates. Connect your resume with real opportunities using advanced AI algorithms.",
  university: "University of St. La Salle",
  college: "College of Computer Science"
};

// Hero section content for main page
export const heroContent = {
  badge: {
    text: "Powered by Advanced AI",
    icon: Sparkles
  },
  title: {
    main: "Connect Your Resume with",
    highlight: "Real Opportunities"
  },
  description: "Transform your job search with AI-powered matching. Get personalized job recommendations, instant resume feedback, and connect with opportunities that match your unique skills.",
  cta: {
    primary: {
      text: "Get Started Free",
      href: "/sign-up"
    },
    secondary: {
      text: "Watch Demo",
      href: "#demo"
    }
  }
};

// Auth page content
export const authContent = {
  badges: [
    { text: "AI-Powered", icon: Sparkles, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    { text: "Smart Matching", icon: Target, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
    { text: "Real-time", icon: Zap, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" }
  ],
  carousel: {
    stats: {
      title: "Making an Impact",
      description: "Join thousands of tech graduates who are finding their perfect career matches through our AI-powered platform."
    }
  },
  signUp: {
    title: "Sign Up",
    description: "Create your account to get started with AI-powered job matching"
  },
  login: {
    title: "Welcome Back",
    description: "Sign in to continue your AI-powered job search journey"
  }
};

// Research info for paper page content
export const researchInfo = {
  title: "AI-Powered Job Matching for Tech Graduates",
  abstract: "Our thesis explores the intersection of artificial intelligence and career development, creating innovative solutions for the modern job market.",
  keywords: ["AI", "Machine Learning", "Job Matching", "Career Development", "Resume Analysis"],
  objectives: [
    "Develop an AI-powered job matching system",
    "Improve job search efficiency for tech graduates", 
    "Create personalized career recommendations",
    "Implement real-time resume analysis"
  ]
};

// Paper/Publication data
export const paperData = {
  title: 'AICA: AI-Powered Career Assistant for Skills-Based Job Matching',
  authors: ['Gamboa, A.F.', 'Hidalgo, J.', 'Mahandog, H.M.', 'Santia, N.E.'],
  keywords: [
    'Artificial Intelligence',
    'Natural Language Processing',
    'Job Matching',
    'Web Scraping',
    'Retrieval Augmented Generation',
    'Skills Assessment',
    'Career Guidance',
  ],
  publicationDate: 'December 2024',
  conference: 'International Conference on AI Applications',
};
