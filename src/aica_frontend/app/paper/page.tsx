import { Navbar } from '@/components/Navbar';
import Paper from '@/components/Paper';
import Testimony from '@/components/Testimony';
import React from 'react';

export default function PaperPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <Paper />
      <Testimony />
    </div>
  );
}
