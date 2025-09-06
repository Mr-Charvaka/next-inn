
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Next Inn',
  description: 'A simulated meeting experience with interactive tools.',
  icons: {
    icon: `https://i.ibb.co/LX5fmmXp/Generated-Image-September-06-2025-11-49-AM-removebg-preview.png?v=${new Date().getTime()}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased dark", inter.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

    