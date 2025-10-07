import Image from 'next/image';
import React from 'react';

export default function Testimony() {
  return (
    <section className="py-20 border-t border-gray-200">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-8">
            <h2 className="text-4xl lg:text-6xl font-bold leading-none tracking-tight">
              <span className="block text-gray-900 mb-4">
                ABOUT OUR
              </span>
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 inline-block rounded-lg shadow-lg">
                RESEARCH
              </span>
            </h2>

            <div className="bg-white p-8 border border-gray-200 shadow-lg max-w-4xl mx-auto rounded-lg">
              <p className="text-gray-900 font-medium text-lg leading-relaxed">
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
                bg: 'bg-violet-600 hover:bg-violet-700',
                name: 'UNIVERSITY OF SAINT LA SALLE',
              },
              {
                src: '/ccs.png',
                alt: 'College of Computing Studies',
                bg: 'bg-violet-600 hover:bg-violet-700',
                name: 'COLLEGE OF COMPUTING STUDIES',
              },
            ].map((institution, index) => (
              <div key={index} className="text-center space-y-6">
                <div
                  className={`${institution.bg} p-8 rounded-lg shadow-lg transition-all duration-300`}
                >
                  <div className="relative w-32 h-32 mx-auto bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                    <Image
                      src={institution.src}
                      alt={institution.alt}
                      className="object-contain"
                      fill
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 rounded-lg shadow-md">
                  <p className="font-semibold uppercase tracking-wide text-sm">
                    {institution.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 rounded-lg shadow-lg inline-block">
              <p className="font-semibold uppercase tracking-widest text-lg">
                ALL RIGHTS RESERVED
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
