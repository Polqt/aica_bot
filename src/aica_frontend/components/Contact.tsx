'use client';
  
import React from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowRight } from 'lucide-react';

export default function Contact() {
  return (
    <section className="relative py-32 bg-gradient-to-br from-violet-600 to-purple-700 overflow-hidden">
      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto text-center space-y-16"
        >
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex justify-center"
            >
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3">
                <span className="text-white font-bold uppercase tracking-wide">Let&apos;s Collaborate</span>
              </div>
            </motion.div>

            <h1 className="text-5xl lg:text-8xl font-black leading-[0.9] tracking-tight text-white">
              <span className="block">INTERESTED IN</span>
              <span className="block relative mt-4">
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  COLLABORATING?
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2"
                />
              </span>
            </h1>
            
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <p className="text-xl text-white font-medium leading-relaxed">
                  Want to help us improve <span className="font-black text-yellow-300">AICA</span> and 
                  turn it into a full job-finding application? Let&apos;s build the future together.
                </p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-200 max-w-2xl mx-auto">
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wide mb-4">
                    Get In Touch
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Ready to make an impact? Drop us a line and let&apos;s discuss how we can work together.
                  </p>
                </div>

                <div className="relative">
                  <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
                    <div className="text-center space-y-4">
                      <p className="text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wide text-sm">
                        Email Us At
                      </p>
                      <a 
                        href="mailto:nyxarcanastudios@gmail.com"
                        className="inline-block text-2xl font-black text-violet-600 dark:text-violet-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 group"
                      >
                        nyxarcanastudios@gmail.com
                        <ArrowRight className="inline-block w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-center"
                >
                  <a
                    href="mailto:nyxarcanastudios@gmail.com?subject=AICA Collaboration Inquiry"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-10 py-4 rounded-2xl font-bold text-lg uppercase tracking-wide shadow-xl shadow-violet-600/25 hover:shadow-2xl hover:shadow-violet-600/40 transition-all duration-300"
                  >
                    <Mail className="w-5 h-5" />
                    Send Message
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/20">
              <p className="text-white font-bold text-lg uppercase tracking-wide">
                Let&apos;s Build The Future Together
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}