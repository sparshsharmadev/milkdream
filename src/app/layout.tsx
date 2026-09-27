/**
 * Motion Intent: High-performance accessible root layout.
 * Clean, dark-mode foundational frame providing smooth font rendering and non-intrusive container.
 */

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Milkdream — Cognitive Archive",
  description: "Capture exact moments. Speak to the void. Send reflections through time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-white selection:text-black">
        <AuthProvider>
          <Navigation />
          <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
