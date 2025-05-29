"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { User, MessageSquare, Settings as SettingsIcon, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import authStore from '@/lib/auth/auth-store';
import { toast } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  // Check if user is logged in and is admin
  useEffect(() => {
    const isLoggedIn = authStore.isLoggedIn();
    const isAdmin = authStore.isAdmin();

    if (!isLoggedIn) {
      toast.error('Please log in to access the admin panel');
      router.push('/');
      return;
    }

    if (!isAdmin) {
      toast.error('Access denied. You need admin privileges to view this page.');
      router.push('/');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    authStore.logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.includes('/admin/users')) return 'users';
    if (pathname.includes('/admin/chats')) return 'chats';
    if (pathname.includes('/admin/settings')) return 'settings';
    if (pathname === '/admin/overview' || pathname === '/admin') return 'overview';
    return 'overview';
  };

  const activeTab = getActiveTab();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-gradient">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-sky-400 rounded-full"></div>
          <div className="h-3 w-3 bg-sky-400 rounded-full"></div>
          <div className="h-3 w-3 bg-sky-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-blue-gradient">
      <div className="absolute inset-0 bg-dots-radial opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-small-white/[0.03] pointer-events-none"></div>

      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-sky-950/90 via-blue-900/80 to-sky-950/90 border-r border-sky-500/20 p-4 z-10">
        <div className="mb-8">
          <Logo />
          <div className="mt-2 text-sm text-sky-300/80">Admin Panel</div>
        </div>

        <nav className="space-y-1">
          <Link
            href="/admin"
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
              ${activeTab === "overview" ? "bg-sky-800/30 text-sky-100" : "text-sky-300 hover:bg-sky-800/20"}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/admin/users"
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
              ${activeTab === "users" ? "bg-sky-800/30 text-sky-100" : "text-sky-300 hover:bg-sky-800/20"}`}
          >
            <User className="h-4 w-4" />
            Users
          </Link>

          <Link
            href="/admin/chats"
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
              ${activeTab === "chats" ? "bg-sky-800/30 text-sky-100" : "text-sky-300 hover:bg-sky-800/20"}`}
          >
            <MessageSquare className="h-4 w-4" />
            Chats
          </Link>

          <Link
            href="/admin/settings"
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
              ${activeTab === "settings" ? "bg-sky-800/30 text-sky-100" : "text-sky-300 hover:bg-sky-800/20"}`}
          >
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-sky-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-sky-100">Admin</div>
              <div className="text-xs text-sky-300/70">admin@example.com</div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-sky-300 hover:text-sky-100"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-sky-500/20 bg-opacity-40 backdrop-blur-xl bg-gradient-to-r from-sky-950/80 via-blue-900/80 to-sky-950/80 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>

            <Button
              variant="outline"
              size="sm"
              className="border-sky-500/30 text-sky-300 hover:bg-sky-800/30"
              onClick={() => router.push('/')}
            >
              Return to Chat
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* Navigation Tabs */}
          <div className="grid w-full grid-cols-4 bg-sky-900/20 border border-sky-500/30 rounded-md mb-4">
            <Link href="/admin" className={`inline-flex w-full items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none cursor-pointer ${activeTab === "overview" ? "bg-sky-800/40 text-white shadow-sm" : "hover:bg-sky-800/30 hover:text-white"}`}>
              Overview
            </Link>
            <Link href="/admin/users" className={`inline-flex w-full items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none cursor-pointer ${activeTab === "users" ? "bg-sky-800/40 text-white shadow-sm" : "hover:bg-sky-800/30 hover:text-white"}`}>
              Users
            </Link>
            <Link href="/admin/chats" className={`inline-flex w-full items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none cursor-pointer ${activeTab === "chats" ? "bg-sky-800/40 text-white shadow-sm" : "hover:bg-sky-800/30 hover:text-white"}`}>
              Chats
            </Link>
            <Link href="/admin/settings" className={`inline-flex w-full items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none cursor-pointer ${activeTab === "settings" ? "bg-sky-800/40 text-white shadow-sm" : "hover:bg-sky-800/30 hover:text-white"}`}>
              Settings
            </Link>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
