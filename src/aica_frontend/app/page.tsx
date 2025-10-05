'use client';

import Hero from '@/components/Hero';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <section className="relative">
        <Hero />
      </section>
    </div>
  );
}
