import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { dir } from 'i18next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "AgentForge - Enterprise AI Orchestration",
  description: "AgentForge provides a secure, scalable, and extensible B2B SaaS platform for orchestrating diverse AI agents across your enterprise.",
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return (
    <html lang={params.lng} dir={dir(params.lng)}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
