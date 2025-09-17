import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AICA - AI Career Assistant',
  description:
    'AICA is an AI-powered career assistant that helps you find your dream tech job by analyzing your resume and matching you with the best opportunities.',
  keywords: 'AI, job matching, resume, tech jobs, career, recruitment',
  authors: [{ name: 'AICA Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col relative">
            <div
              className={cn(
                'absolute inset-0 z-0',
                '[background-size:40px_40px]',
                '[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]',
                'dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]',
              )}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/90 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black/90"></div>
            <main className="flex-1 relative z-10">{children}</main>
          </div>

          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              classNames: {
                toast: 'backdrop-blur-sm border border-border/50 shadow-lg',
                title: 'font-semibold',
                description: 'text-sm opacity-90',
                error: 'border-red-500/50 bg-red-50/50 dark:bg-red-950/50',
                success:
                  'border-green-500/50 bg-green-50/50 dark:bg-green-950/50',
                warning:
                  'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/50',
                info: 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/50',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
