import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ATSIT Finance Pro",
  description: "Modern Finance Management System",
};

import { getCompanySettings } from '@/lib/company-data';
import Sidebar from "@/components/Sidebar";
import { auth } from '@/auth';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getCompanySettings();
  const session = await auth();

  return (
    <html lang="es-CL">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <div className="flex min-height-screen">
          <Sidebar companyName={settings.name} user={session?.user} />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
