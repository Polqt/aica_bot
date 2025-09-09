import React from 'react';
import { Card } from './ui/card';
import { team, mentors } from '@/lib/constants/app-data';

export default function Team() {

  return (
    <section className="space-y-12 text-center">
      <div>
        <h2 className="text-3xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100">Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4 max-w-6xl mx-auto">
          {team.map(member => (
            <Card
              key={member.name}
              className="p-6 hover:shadow-xl transition-shadow rounded-xl glass-card-enhanced text-center"
            >
              <div className="h-24 w-24 mx-auto mb-4 bg-gradient-to-tr from-indigo-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {member.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{member.name}</h3>
              <p className="text-slate-600 dark:text-slate-300">
                {member.role}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-20 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800 dark:text-slate-100">Special Thanks</h2>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl border border-slate-200/50 dark:border-0 shadow-sm dark:shadow-none">
          <ul className="list-none space-y-3 text-slate-700 dark:text-slate-300">
            {mentors.map((m, i) => (
              <li key={i} className="flex items-center justify-center">
                <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3"></span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
