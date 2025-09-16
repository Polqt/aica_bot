import Image from 'next/image';
import React from 'react';

export default function Testimony() {
  return (
    <section className="bg-white dark:bg-black py-20 border-t-4 border-black dark:border-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-8">
            <h2 className="text-4xl lg:text-6xl font-black leading-none tracking-tight">
              <span className="block text-black dark:text-white">
                ABOUT OUR
              </span>
              <span className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 inline-block transform -skew-x-6 mt-4">
                RESEARCH
              </span>
            </h2>

            <div className="bg-zinc-100 dark:bg-zinc-800 p-8 border-4 border-black dark:border-white max-w-4xl mx-auto">
              <p className="text-black dark:text-white font-bold text-lg leading-relaxed uppercase tracking-wide">
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
                bg: 'bg-blue-500',
                name: 'UNIVERSITY OF SAINT LA SALLE',
              },
              {
                src: '/ccs.png',
                alt: 'College of Computing Studies',
                bg: 'bg-green-500',
                name: 'COLLEGE OF COMPUTING STUDIES',
              },
            ].map((institution, index) => (
              <div key={index} className="text-center space-y-6">
                <div
                  className={`${institution.bg} p-8 border-4 border-black dark:border-white transform hover:rotate-3 hover:scale-105 transition-all duration-300`}
                >
                  <div className="relative w-32 h-32 mx-auto bg-white border-4 border-black dark:border-white p-4">
                    <Image
                      src={institution.src}
                      alt={institution.alt}
                      className="object-contain"
                      fill
                    />
                  </div>
                </div>

                <div className="bg-black dark:bg-white p-4 border-2 border-black dark:border-white">
                  <p className="text-white dark:text-black font-black uppercase tracking-wide text-sm">
                    {institution.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="bg-yellow-400 dark:bg-yellow-500 p-6 border-4 border-black dark:border-white inline-block transform rotate-1">
              <p className="text-black font-black uppercase tracking-widest text-lg">
                ALL RIGHTS RESERVED
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
