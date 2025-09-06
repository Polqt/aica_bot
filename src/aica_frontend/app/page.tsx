'use client';

import { motion } from 'motion/react';
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Target,
  Zap,
  TrendingUp,
  Users,
  ArrowRight,
  Play,
} from 'lucide-react';
import Link from 'next/link';

const features = [
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

const stats = [
  { value: "95%", label: "Match Accuracy" },
  { value: "10K+", label: "Active Users" },
  { value: "50K+", label: "Jobs Matched" },
  { value: "24/7", label: "AI Support" }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge variant="secondary" className="glass px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Powered by Advanced AI
                </Badge>

                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Connect Your Resume with
                  <span className="gradient-text block">Real Opportunities</span>
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed">
                  Transform your job search with AI-powered matching. Get personalized job recommendations,
                  instant resume feedback, and connect with opportunities that match your unique skills.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="btn-modern group">
                  <Link href="/sign-up">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <Button variant="outline" size="lg" className="btn-modern group">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-background flex items-center justify-center text-white text-sm font-semibold"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold">Join 10,000+ professionals</p>
                  <p className="text-sm text-muted-foreground"> who&apos;ve found their perfect match</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute top-8 right-8 w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300" />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Your Job Matches</h3>
                    <Badge variant="secondary">95% Match</Badge>
                  </div>

                  <div className="space-y-4">
                    {[
                      { company: "TechCorp", role: "Senior Developer", match: "98%" },
                      { company: "InnovateLabs", role: "Full Stack Engineer", match: "94%" },
                      { company: "DataFlow", role: "React Developer", match: "91%" }
                    ].map((job, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">{job.role}</p>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          {job.match}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">AICA</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of job searching with our cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card h-full hover:scale-105 transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
