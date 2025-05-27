'use client';

import { usePathname } from 'next/navigation';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-screen flex">
      <main className="flex-1 bg-background">
        {children}
      </main>
    </div>
  );
} 