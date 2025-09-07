import React from 'react';
import { Card } from './ui/card';
import { team, mentors } from '@/lib/constants/app-data';

export default function Team() {

  return (
    <section className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold text-center mb-8 mt-16">Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-12">
          {team.map(member => (
            <Card
              key={member.name}
              className="p-6 hover:shadow-xl transition-shadow rounded-xl bg-white dark:bg-neutral-800 text-center"
            >
              <div className="h-24 w-24 mx-auto mb-4 bg-gradient-to-tr from-indigo-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {member.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-neutral-500 dark:text-neutral-300">
                {member.role}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Special Thanks</h2>
        <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2">
          {mentors.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
