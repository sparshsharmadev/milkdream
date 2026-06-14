import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { EB_Garamond } from 'next/font/google';
import type { Metadata } from "next";

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: "Milkdream | Time Capsule",
  description: "Capture memories and send them through time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${ebGaramond.variable}`}>
      <body className="antialiased min-h-screen text-white bg-black font-sans selection:bg-white selection:text-black">
        <div className="bg-noise"></div>
        <AuthProvider>
          <Navigation />
          <main className="pt-20 relative z-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
