import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ClientBody from "@/components/layout/ClientBody";
import { Toaster } from "sonner";
import DatabaseErrorAlert from '@/components/ui/DatabaseErrorAlert';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Double AI - Advanced Intelligence",
  description: "The future of AI conversation with state-of-the-art capabilities",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} dark`} suppressHydrationWarning>
      <ClientBody>
        <DatabaseErrorAlert />
        <Toaster position="top-center" />
        {children}
      </ClientBody>
    </html>
  );
}
