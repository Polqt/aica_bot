import Image from 'next/image';
import React from 'react';

export default function Testimony() {
  return (
    <section className="text-center space-y-8">
      <h2 className="text-3xl font-bold">About Our Research</h2>
      <p className="max-w-3xl mx-auto text-neutral-700 dark:text-neutral-300">
        This research paper is part of an undergraduate study by Gamboa,
        Hidalgo, Mahandog, and Santia for University of Saint La Salle - College
        of Computing Studies.
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 mt-8">
        {[
          { src: '/usls.png', alt: 'University of Saint La Salle' },
          { src: '/ccs.png', alt: 'College of Computing Studies' },
        ].map((img, i) => (
          <div
            key={i}
            className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl"
          >
            <Image
              src={img.src}
              alt={img.alt}
              className="object-contain"
              fill
            />
          </div>
        ))}
      </div>

      <p className="mt-4 text-neutral-500 dark:text-neutral-400">
        All Rights Reserved.
      </p>
    </section>
  );
}
