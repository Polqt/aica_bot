'use client';

import Image from 'next/image';
import { motion } from 'motion/react';

export default function Footer() {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 backdrop-blur-xl border-t border-violet-400/30 py-4 shadow-2xl shadow-violet-600/20">
        <div className="container mx-auto px-6 flex justify-end items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-4 group"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 group-hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2">
                <Image
                  src="/NYXARCANALOGO_TRANSPARENT-02.png"
                  alt="Nyx Arcana Logo"
                  width={32}
                  height={32}
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                />
                <p className="text-white font-black text-sm tracking-widest uppercase">
                  NYX ARCANA STUDIOS
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
