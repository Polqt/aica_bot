import { Navbar } from '@/components/Navbar';
import dynamic from 'next/dynamic';
import React from 'react';

const Team = dynamic(() => import('@/components/Team'), {
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
});

const Contact = dynamic(() => import('@/components/Contact'), {
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
});

const Testimony = dynamic(() => import('@/components/Testimony'), {
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
});

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <Team />
      <Contact />
      <Testimony />
    </div>
  );
}
