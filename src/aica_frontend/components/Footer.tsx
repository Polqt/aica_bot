import Image from 'next/image';
import React from 'react';

export default function Footer() {
  return (
    <footer className="relative z-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <Image 
                src={"/NYXARCANALOGO_TRANSPARENT2-02.png"}
                alt='Nyx Arcana Studios Logo'
                width={50}
                height={75}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Nyx Arcana Studios</p>
              <p className="text-xs text-gray-500">Building the future of career matching</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-xs text-gray-600">All rights reserved © 2025</p>
          </div>
        </div>
      </div>
    </footer>
  );
}