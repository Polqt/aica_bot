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
    <section className="py-32">
      <div className="container mx-auto px-6">
        <div className="mb-24">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-7xl font-bold leading-tight mb-8">
              <span className="block text-gray-900 dark:text-white">
                MEET THE
              </span>
              <span className="block relative mt-4">
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  TEAM
                </span>
              </span>
            </h2>
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
                  className="group relative bg-white border border-gray-200 rounded-xl p-8 text-center hover:border-violet-300 hover:shadow-lg transition-all duration-500 overflow-hidden hover:-translate-y-2"
                >
                  {/* Image container */}
                  <div className="relative w-28 h-28 mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300">
                    <div
                      className={`w-full h-full ${colors[index].bg} rounded-xl ${colors[index].shadow} shadow-lg`}
                    />
                    <div className="absolute inset-0 border-2 border-white rounded-xl overflow-hidden">
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
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-violet-600 transition-colors duration-300">
                      {member.name}
                    </h3>
                    <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm">
                      {member.role}
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8">
                <h3 className="text-3xl font-semibold text-white uppercase tracking-wide text-center">
                  Special Thanks
                </h3>
                <p className="text-violet-100 text-center font-medium mt-2">
                  To our amazing mentors and advisors
                </p>
              </div>

              <div className="p-8">
                <div className="grid gap-6">
                  {mentors.map((mentor, index) => (
                    <div
                      key={index}
                      className="group flex items-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="w-4 h-4 bg-gradient-to-r from-violet-600 to-purple-600 mr-6 flex-shrink-0 rounded-full group-hover:scale-125 transition-all duration-300" />
                      <p className="text-gray-700 font-medium text-lg group-hover:text-violet-600 transition-colors duration-300">
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
