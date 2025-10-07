'use client';

import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

export default function Video() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            LIGHTS, CAMERA, AICACTION!
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch how our AI-powered platform transforms your job search experience
          </p>
        </div>

        <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="aspect-video bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center relative">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">AICA Demo Video</h3>
                <p className="text-gray-600">Experience intelligent job matching</p>
              </div>
            </div>

            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-gray-900 ml-0.5" />
                ) : (
                  <Play className="w-6 h-6 text-gray-900 ml-1" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-gray-700" />
                  ) : (
                    <Play className="w-5 h-5 text-gray-700" />
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-gray-700" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-gray-700" />
                    )}
                  </button>
                  <div className="w-24 h-1 bg-gray-200 rounded-full">
                    <div className="w-1/2 h-1 bg-violet-600 rounded-full"></div>
                  </div>
                </div>

                <span className="text-sm text-gray-600 font-medium">0:00 / 2:30</span>
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Maximize className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Description */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 max-w-2xl mx-auto">
            This demo showcases how AICA analyzes your resume, matches you with relevant opportunities,
            and provides personalized insights to accelerate your career growth.
          </p>
        </div>
      </div>
    </section>
  );
}
