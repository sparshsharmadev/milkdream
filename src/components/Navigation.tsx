"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Plus, Home } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user || pathname === '/editor') return null;

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between transition-all">
      <Link href="/dashboard" className="flex items-center">
        <Image src="/logo.png" alt="Milkdream" width={40} height={40} className="object-contain" />
      </Link>

      <div className="flex items-center space-x-4">
        <Link 
          href="/dashboard"
          className={`p-2 transition-colors ${pathname === '/dashboard' ? 'text-white' : 'text-white/40 hover:text-white'}`}
        >
          <Home className="w-5 h-5" />
        </Link>
        <Link 
          href="/editor"
          className={`flex items-center space-x-2 px-4 py-2 border transition-colors font-medium text-sm ${pathname === '/editor' ? 'border-white text-white' : 'border-white/20 text-white/60 hover:text-white hover:border-white/50'}`}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Capsule</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="p-2 text-white/40 hover:text-white transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
