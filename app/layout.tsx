import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getCompanySettings } from '@/lib/company-data';
import { initializeDatabase } from '@/lib/db';
import Sidebar from "@/components/Sidebar";
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';

import { checkLicenseStatus } from '@/lib/license';
import LicenseBannerModal from '@/components/LicenseBannerModal';

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ATSIT Finanzas",
  description: "Sistema de Gestión Financiera",
};

import InitialSetupModal from '@/components/InitialSetupModal';
import { recordProjectLaunch } from '@/lib/demo-counter';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await initializeDatabase();
  await recordProjectLaunch();
  const settings = await getCompanySettings();
  const session = await auth();
  const license = await checkLicenseStatus();

  return (
    <html lang="es-CL">
      <body className={`${inter.className} antialiased h-screen overflow-hidden bg-[#0b0f17]`} suppressHydrationWarning>
        <SessionProvider session={session}>
          <div className="flex flex-col h-screen w-screen overflow-hidden">
            {session?.user && (
              <>
                <LicenseBannerModal
                  isExpired={license.isExpired}
                  isFull={license.isFull}
                  daysRemaining={license.daysRemaining}
                  hardwareId={license.hardwareId}
                />
                <InitialSetupModal isConfigured={settings.isConfigured} />
              </>
            )}
            <div className="flex flex-1 h-full overflow-hidden">
              <Sidebar companyName={settings.name} user={session?.user} />
              <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 pt-24 md:p-8 md:pt-8 custom-scrollbar">
                {children}
              </main>
            </div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
