import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
// import Footer from '@/components/Footer';

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
  title: 'AICA - AI-Powered Job Matching',
  description: 'Connect your resume with real job opportunities using AI — personalized, real-time job matching for tech graduates.',
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
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />
            <div className="fixed inset-0 overflow-hidden -z-10">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <main className="flex-1 relative z-10">{children}</main>
            {/* <Footer /> */}
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
                success: 'border-green-500/50 bg-green-50/50 dark:bg-green-950/50',
                warning: 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/50',
                info: 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/50',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
