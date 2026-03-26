import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/navigation/Navbar";
import AppToaster from "@/components/ui/AppToaster";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Feedback Board | MVP",
  description: "Платформа для сбора и обсуждения фидбека",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <AuthProvider>
          {/* Global Background Decorations */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse transition-opacity duration-1000" />
            <div className="absolute top-[30%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
            <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-indigo-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>

          <div className="min-h-screen flex flex-col relative z-10">
            <Navbar />
            <main className="flex-1 w-full flex flex-col items-center">
              <div className="w-full max-w-[1100px] px-6">
                {children}
              </div>
            </main>
          </div>
          <AppToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
