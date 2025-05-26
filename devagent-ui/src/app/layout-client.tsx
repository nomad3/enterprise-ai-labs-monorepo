'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './components/ui/Sidebar';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <div className="dark min-h-screen flex">
      {!isLandingPage && <Sidebar />}
      <main className="flex-1 bg-background">
        {children}
      </main>
    </div>
  );
} 