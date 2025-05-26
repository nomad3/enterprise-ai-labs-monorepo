'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './contexts/AuthContext';
import Link from 'next/link'; // Link might be used by Sidebar, keeping it for now. Or Sidebar handles its own.
import { Rocket } from 'lucide-react'; // Keeping Rocket for the header if needed, or Sidebar handles its own.
import Sidebar from './components/Sidebar'; // Import the new Sidebar component
import { usePathname } from 'next/navigation'; // Import usePathname

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// navItems are now defined within Sidebar.tsx

export const metadata: Metadata = {
  title: "DevAgent - Full-Stack Developer & DevOps AI Agent",
  description: "A comprehensive development platform that combines AI-powered code generation, testing, version control, and CI/CD capabilities with advanced DevOps and cloud architecture features.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <html lang="en">
      <body className={inter.variable}>
        <div className="dark min-h-screen flex">
          {!isLandingPage && (
            <Sidebar />
          )}
          <main className="flex-1 min-h-screen bg-background text-foreground">
            <AuthProvider>
              {children}
            </AuthProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
