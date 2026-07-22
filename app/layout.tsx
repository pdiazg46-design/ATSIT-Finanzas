import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getCompanySettings } from '@/lib/company-data';
import { initializeDatabase } from '@/lib/db';
import Sidebar from "@/components/Sidebar";
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ATSIT Finance Pro",
  description: "Modern Finance Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await initializeDatabase();
  const settings = await getCompanySettings();
  const session = await auth();

  return (
    <html lang="es-CL">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <SessionProvider session={session}>
          <div className="flex min-h-screen">
            <Sidebar companyName={settings.name} user={session?.user} />
            <main className="flex-1 p-4 pt-24 md:p-8 md:pt-8">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
