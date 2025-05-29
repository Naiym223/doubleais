"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/context/ChatContext';
import Settings from './Settings';
import { motion } from 'framer-motion';
import { Github, Stars, LogOut, User, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import authStore from '@/lib/auth/auth-store';
import { toast } from 'sonner';
import Link from 'next/link';

export default function Header() {
  const { currentSessionId, getChatSession } = useChat();
  const currentSession = getChatSession(currentSessionId);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  // Load user from auth store
  useEffect(() => {
    const currentUser = authStore.getCurrentUser();
    if (currentUser) {
      setUser({
        name: currentUser.name,
        role: currentUser.role
      });
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    authStore.logout();
    toast.success('Logged out successfully');
    window.location.reload(); // Refresh the page to show login screen
  };

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-10 border-b border-sky-500/20 bg-opacity-40 backdrop-blur-xl bg-gradient-to-r from-sky-950/80 via-blue-900/80 to-sky-950/80">
      <div className="flex h-16 items-center justify-between px-4">
        <motion.div
          className="md:hidden flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Logo size="small" showText={true} />
        </motion.div>

        <motion.div
          className="hidden md:flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex items-center space-x-1 px-3 py-1.5 rounded-full bg-sky-900/30 border border-sky-500/20"
          >
            <Stars className="h-4 w-4 text-sky-300" />
            <span className="text-sm font-medium text-sky-200 truncate max-w-[150px]">
              {currentSession?.title || 'New Chat'}
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* User information */}
          {user && (
            <div className="rounded-full border border-sky-500/30 bg-sky-900/30 py-1 px-3 text-xs text-sky-300">
              <div className="flex items-center gap-1.5">
                <User className="h-3 w-3" />
                <span className="hidden md:inline">{user.name}</span>
                <span className="text-sky-400/70">({user.role})</span>
              </div>
            </div>
          )}

          {/* Admin panel link for admin users */}
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg text-sky-300 hover:text-sky-100 hover:bg-sky-800/30 border border-sky-500/10"
              >
                <ShieldCheck className="h-5 w-5" />
                <span className="sr-only">Admin Panel</span>
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg text-sky-300 hover:text-sky-100 hover:bg-sky-800/30 border border-sky-500/10"
            onClick={() => window.open('https://github.com/double-labs/double-ai', '_blank')}
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Button>

          <Settings />

          {/* Logout button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg text-sky-300 hover:text-sky-100 hover:bg-sky-800/30 border border-sky-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
