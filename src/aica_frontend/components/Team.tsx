'use client';

import React from 'react';
import Image from 'next/image';

const team = [
  { name: 'April Faith Gamboa', role: 'Researcher', img: '/april.png' },
  { name: 'Janpol Hidalgo', role: 'Developer', img: '/jepoy.png' },
  { name: 'Heidine Mahandog', role: 'Developer', img: '/heidine.png' },
  { name: 'Nathania Santia', role: 'Project Manager', img: '/nathania.png' },
];

const mentors = [
  { name: 'Julian Diego Mapa', role: 'Technical Advisor' },
  { name: 'Dr. Eddie De Paula', role: 'Thesis Co-Adviser' },
  { name: 'Dr. Eischeid Arcenal', role: 'AI Specialist' },
];

export default function Team() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-violet-50 dark:from-gray-950 dark:to-violet-950/20 py-32">
      <div className="container mx-auto px-6">
        <div className="mb-24">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-7xl font-black leading-tight mb-8">
              <span className="block text-gray-900 dark:text-white">
                MEET THE
              </span>
              <span className="block relative mt-4">
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  TEAM
                </span>
              </span>
            </h2>
            <div className="max-w-3xl mx-auto relative">
              <div className="absolute -left-6 top-0 w-2 h-full bg-gradient-to-b from-violet-600 to-purple-600 transform -skew-y-2" />
              <div className="absolute -right-2 top-4 w-4 h-4 bg-yellow-400 rotate-45" />
              <p className="text-2xl text-gray-700 dark:text-gray-300 font-bold pl-12 transform rotate-1 bg-white dark:bg-gray-900 py-6 px-8 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_theme(colors.violet.600)]">
                Dedicated Computer Science students building the future of job
                matching
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => {
              const colors = [
                { bg: 'bg-violet-500', shadow: 'shadow-violet-600/20' },
                { bg: 'bg-purple-500', shadow: 'shadow-purple-600/20' },
                { bg: 'bg-blue-500', shadow: 'shadow-blue-600/20' },
                { bg: 'bg-indigo-500', shadow: 'shadow-indigo-600/20' },
              ];

              return (
                <div
                  key={member.name}
                  className="group relative bg-white dark:bg-gray-900 border-3 border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-2xl hover:shadow-violet-600/20 transition-all duration-500 overflow-hidden hover:-translate-y-2"
                >
                  {/* Corner decorations */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-violet-600 rounded-full opacity-60" />
                  <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-600 rounded-full opacity-40" />

                  {/* Image container */}
                  <div className="relative w-28 h-28 mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <div
                      className={`absolute inset-0 ${colors[index].bg} rounded-2xl transform rotate-2 ${colors[index].shadow} shadow-lg`}
                    />
                    <div className="relative w-full h-full border-3 border-white dark:border-gray-800 rounded-2xl overflow-hidden transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
                      <Image
                        src={member.img}
                        width={112}
                        height={112}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
                      {member.name}
                    </h3>
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gray-900 dark:bg-gray-700 transform translate-x-1 translate-y-1 rounded-xl opacity-30" />
                      <div className="relative bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-200">
                        {member.role}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mentors Section */}
        <div>
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-gray-900/10 dark:shadow-black/40 border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-3xl transition-shadow duration-500">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8 relative">
                <div className="absolute top-4 right-4 w-2 h-8 bg-white/20" />
                <h3 className="text-3xl font-black text-white uppercase tracking-wide text-center">
                  Special Thanks
                </h3>
                <p className="text-violet-100 text-center font-semibold mt-2">
                  To our amazing mentors and advisors
                </p>
              </div>

              <div className="p-8">
                <div className="grid gap-6">
                  {mentors.map((mentor, index) => (
                    <div
                      key={index}
                      className="group flex items-center p-6 bg-gradient-to-r from-gray-50 to-violet-50 dark:from-gray-800 dark:to-violet-900/20 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-lg hover:shadow-violet-600/10 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="w-4 h-4 bg-gradient-to-r from-violet-600 to-purple-600 mr-6 flex-shrink-0 group-hover:scale-125 group-hover:rotate-45 transition-all duration-300 border border-white shadow-sm" />
                      <p className="text-gray-700 dark:text-gray-300 font-bold text-lg group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
                        {mentor.name} - {mentor.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
