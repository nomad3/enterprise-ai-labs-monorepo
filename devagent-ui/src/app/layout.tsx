import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutClient from './layout-client';
import { AuthProvider } from './contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "DevAgent - Full-Stack Developer & DevOps AI Agent",
  description: "A comprehensive development platform that combines AI-powered code generation, testing, version control, and CI/CD capabilities with advanced DevOps and cloud architecture features.",
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return (
    <html lang={params.lng}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
