import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GraveyardProvider } from '@/contexts/GraveyardContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { BurialRecordProvider } from '@/contexts/BurialRecordContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { MaintenanceProvider } from '@/contexts/MaintenanceContext';
import Sidebar from '@/components/Sidebar';
import LayoutContent from '@/components/LayoutContent';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Graveyard Management System',
  description: 'Modern graveyard plot and grave management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <GraveyardProvider>
            <BurialRecordProvider>
              <FinanceProvider>
                <MaintenanceProvider>
                  <LayoutContent>
                    {children}
                  </LayoutContent>
                </MaintenanceProvider>
              </FinanceProvider>
            </BurialRecordProvider>
          </GraveyardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
