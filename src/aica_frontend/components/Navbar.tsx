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
      <ResizableNavbar className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/90 border-b-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)]">
        <NavBody className="px-8 py-4">
          <div className="flex items-center">
            <NavbarLogo />
          </div>

          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item, idx) => (
              <Link
                key={`nav-link-${idx}`}
                href={item.link}
                className="px-5 py-2 border border-black dark:border-white bg-background dark:bg-background text-foreground dark:text-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium tracking-wide text-sm transition-all transform hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-0 z-10">
            <Link
              href="/login"
              className="px-6 py-3 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-violet-400 hover:text-black dark:hover:bg-violet-400 dark:hover:text-black font-bold uppercase tracking-wide text-sm transition-all"
            >
              LOGIN
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-violet-400 hover:text-black dark:hover:bg-violet-400 border-2 border-black dark:border-white font-bold uppercase tracking-wide text-sm transition-all transform hover:scale-105"
            >
              SIGN UP
            </Link>
          </div>
        </NavBody>

        <MobileNav className="bg-white dark:bg-black border-b-4 border-black dark:border-white">
          <MobileNavHeader className="px-6 py-4">
            <div className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 font-black text-xl tracking-wider transform -skew-x-12">
              AICA
            </div>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            className="bg-white dark:bg-black border-t-4 border-black dark:border-white px-6 py-8 space-y-4"
          >
            {navItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full p-4 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-violet-400 hover:text-black font-bold uppercase tracking-wide text-center transform hover:scale-105 transition-all"
              >
                {item.name}
              </Link>
            ))}

            <div className="flex flex-col gap-4 mt-8">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full p-4 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-violet-400 hover:text-black font-bold uppercase tracking-wide text-center transition-all"
              >
                LOGIN
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full p-4 bg-black dark:bg-white text-white dark:text-black hover:bg-violet-400 hover:text-black border-2 border-black dark:border-white font-bold uppercase tracking-wide text-center transform hover:scale-105 transition-all"
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
