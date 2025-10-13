import type { Metadata } from 'next';
import { Inter, Lora, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';

// Notion Default Font (Sans-serif)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-default',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// Notion Serif Font
const lora = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// Notion Mono Font
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'AICA - AI Career Assistant',
  description:
    'AICA is an AI-powered career assistant that helps you find your dream tech job by analyzing your resume and matching you with the best opportunities.',
  keywords: 'AI, job matching, resume, tech jobs, career, recruitment',
  authors: [{ name: 'AICA Team' }],
  openGraph: {
    title: 'AICA - AI Career Assistant',
    description:
      'Find your dream tech job with AI-powered resume analysis and job matching.',
    siteName: 'AICA',
    images: [
      {
        url: '/AICA Logo.svg',
        width: 1200,
        height: 630,
        alt: 'AICA - AI Career Assistant',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@type': 'WebApplication',
    name: 'AICA - AI Career Assistant',
    description:
      'AI-powered career assistant that helps you find your dream tech job by analyzing your resume and matching you with the best opportunities.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    creator: {
      '@type': 'Organization',
      name: 'AICA Team',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${lora.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen bg-white dark:bg-black">
            <div className="fixed inset-0">
              <div
                className={cn(
                  'absolute inset-0',
                  '[background-size:40px_40px]',
                  '[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]',
                  'dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]',
                )}
              />
              <div className="pointer-events-none absolute inset-0 bg-white/10 dark:bg-black/10" />
            </div>

            {/* Content */}
            <main className="relative z-10">{children}</main>
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
