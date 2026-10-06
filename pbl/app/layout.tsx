import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/AppContext';

export const metadata: Metadata = {
  title: 'Nashik Monitor | Closed ≠ Resolved',
  description: 'Nashik Municipal Corporation citizen accountability & road project DLP monitor with Closed ≠ Resolved verification.',
  keywords: ['Nashik', 'NMC', 'Civic governance', 'Potholes', 'DLP road warranty', 'Closed is not Resolved', 'Maharashtra']
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
