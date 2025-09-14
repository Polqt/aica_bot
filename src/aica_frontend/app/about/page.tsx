import Contact from '@/components/Contact';
import { Navbar } from '@/components/Navbar';
import Team from '@/components/Team';
import Testimony from '@/components/Testimony';
import React from 'react';

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
