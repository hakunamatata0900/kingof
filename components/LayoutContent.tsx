"use client";

import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { ReactNode } from 'react';

export default function LayoutContent({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
