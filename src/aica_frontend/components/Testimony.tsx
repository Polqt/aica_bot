import Image from 'next/image';
import React from 'react';

export default function Testimony() {
  return (
    <section className="py-20 border-t-2 border-black dark:border-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-8">
            <h2 className="text-4xl lg:text-6xl font-black leading-none tracking-tight">
              <span className="block text-foreground dark:text-foreground mb-4">
                ABOUT OUR
              </span>
              <span className="bg-violet-600 hover:bg-violet-400 hover:text-black text-white px-6 py-3 inline-block transform -rotate-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-1 hover:translate-x-1">
                RESEARCH
              </span>
            </h2>

            <div className="bg-background/95 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] max-w-4xl mx-auto transform hover:-translate-y-1 hover:translate-x-1 transition-all">
              <p className="text-foreground dark:text-foreground font-bold text-lg leading-relaxed">
                THIS RESEARCH PAPER IS PART OF AN UNDERGRADUATE STUDY BY GAMBOA,
                HIDALGO, MAHANDOG, AND SANTIA FOR UNIVERSITY OF SAINT LA SALLE -
                COLLEGE OF COMPUTING STUDIES.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {[
              {
                src: '/usls.png',
                alt: 'University of Saint La Salle',
                bg: 'bg-violet-600 hover:bg-violet-400',
                name: 'UNIVERSITY OF SAINT LA SALLE',
              },
              {
                src: '/ccs.png',
                alt: 'College of Computing Studies',
                bg: 'bg-violet-600 hover:bg-violet-400',
                name: 'COLLEGE OF COMPUTING STUDIES',
              },
            ].map((institution, index) => (
              <div key={index} className="text-center space-y-6">
                <div
                  className={`${institution.bg} p-8 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transform hover:-translate-y-1 hover:translate-x-1 transition-all duration-300`}
                >
                  <div className="relative w-32 h-32 mx-auto bg-background border-2 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <Image
                      src={institution.src}
                      alt={institution.alt}
                      className="object-contain"
                      fill
                    />
                  </div>
                </div>

                <div className="bg-violet-600 hover:bg-violet-400 hover:text-black text-white p-4 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transform hover:-translate-y-1 hover:translate-x-1 transition-all">
                  <p className="font-black uppercase tracking-wide text-sm">
                    {institution.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="bg-violet-600 hover:bg-violet-400 hover:text-black text-white p-6 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] inline-block transform -rotate-2 hover:-translate-y-1 hover:translate-x-1 transition-all">
              <p className="font-black uppercase tracking-widest text-lg">
                ALL RIGHTS RESERVED
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
