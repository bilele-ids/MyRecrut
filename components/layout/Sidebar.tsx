"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Briefcase, LogOut,
  Settings, BarChart2, Menu, X, Bookmark
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/candidatures", icon: Briefcase, label: "Candidatures" },
  { href: "/statistiques", icon: BarChart2, label: "Statistiques" },
  { href: "/bookmarklet", icon: Bookmark, label: "Bookmarklet" },
  { href: "/compte", icon: Settings, label: "Mon compte" },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="MyRecrut" width={36} height={36} className="rounded-xl bg-white p-0.5" />
          <span className="text-xl font-bold text-white tracking-tight">MyRecrut</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-brand text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-6">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Barre mobile en haut */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="MyRecrut" width={28} height={28} className="rounded-lg bg-white p-0.5" />
          <span className="text-base font-bold text-white">MyRecrut</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-400 hover:text-white p-1"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 bg-gray-900 flex-col h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Drawer mobile */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed top-0 left-0 z-50 w-72 bg-gray-900 h-screen flex flex-col lg:hidden shadow-2xl">
            <NavContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}
