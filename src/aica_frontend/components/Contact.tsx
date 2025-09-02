'use client';
  
import React from 'react';
import { HeroHighlight, Highlight } from './ui/hero-highlight';
import { motion } from 'motion/react';

export default function Contact() {
  return (
    <section className="py-16 text-center rounded-xl">
      <HeroHighlight>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [20, -5, 0] }}
          transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
          className="text-3xl md:text-5xl font-extrabold max-w-4xl mx-auto leading-snug"
        >
          <Highlight className="text-indigo-600 dark:text-indigo-400">
            Interested in Collaborating?
          </Highlight>
        </motion.h1>
      </HeroHighlight>
      <p className="mt-4 text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto">
        Want to help us improve AICA and turn it into a full job-finding app?
        Get in touch with us at:
      </p>
      <span className="mt-2 inline-block text-indigo-700 dark:text-indigo-400 font-medium">
        nyxarcanastudios@gmail.com
      </span>
    </section>
  );
}
