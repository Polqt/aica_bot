'use client';

import {
  Navbar as ResizableNavbar,
  NavBody,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from '@/components/ui/resizable-navbar';
import { useState } from 'react';
import Link from 'next/link';

export function Navbar() {
  const navItems = [
    {
      name: 'HOME',
      link: '/',
    },
    {
      name: 'ABOUT',
      link: '/about',
    },
    {
      name: 'PAPER',
      link: '/paper',
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <ResizableNavbar>
        <NavBody>
          <NavbarLogo />
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item, idx) => (
              <Link
                key={`nav-link-${idx}`}
                href={item.link}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 z-10">
            <Link
              href="/login"
              className="px-3 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              LOGIN
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-violet-600 text-white hover:bg-violet-700 font-medium text-sm transition-colors rounded-md"
            >
              SIGN UP
            </Link>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            className="bg-white/95 backdrop-blur border-t border-gray-200/50 px-6 py-8 space-y-4"
          >
            {navItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full p-3 text-gray-600 hover:text-gray-900 font-medium text-center transition-colors"
              >
                {item.name}
              </Link>
            ))}

            <div className="flex flex-col gap-4 mt-8 pt-4 border-t border-gray-200">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full p-3 text-gray-600 hover:text-gray-900 font-medium text-center transition-colors"
              >
                LOGIN
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full p-3 bg-violet-600 hover:bg-violet-700 text-white font-medium text-center rounded-md transition-colors"
              >
                SIGN UP
              </Link>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </ResizableNavbar>
    </div>
  );
}
