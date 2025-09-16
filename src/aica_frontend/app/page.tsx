'use client';

import Hero from "@/components/Hero";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="relative overflow-hidden">
        <Hero />
      </section>
    </div>
  );
}
