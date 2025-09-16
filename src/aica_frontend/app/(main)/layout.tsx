import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div
        className={cn(
          'absolute inset-0',
          '[background-size:40px_40px]',
          '[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]',
          'dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]',
        )}
      />
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">AICA</h1>
        </div>
        <nav className="mt-6">
          <Link
            href="/dashboard"
            className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Dashboard
          </Link>
          <Link
            href="/job-matches"
            className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Job Matches
          </Link>
          <Link
            href="/saved-jobs"
            className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Saved Jobs
          </Link>
          <Link
            href="/profile"
            className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Profile
          </Link>
        </nav>
      </aside>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
