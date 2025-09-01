'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-l from-[#8B7CFF]/90 via-[#8B7CFF]/80 to-transparent py-2 shadow-lg z-50 backdrop-blur-sm rounded-t-3xl">
      <div className="w-full flex justify-end items-center pr-2">
        <div className="flex items-center space-x-3 mr-4">
          <Image
            src="/NYXARCANALOGO_TRANSPARENT-02.png"
            alt="Nyx Arcana Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <p className="text-white text-sm tracking-wide whitespace-nowrap">NYX ARCANA STUDIOS</p>
        </div>
      </div>
    </div>
  );
}
