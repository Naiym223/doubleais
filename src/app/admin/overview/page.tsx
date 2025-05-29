"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, MessageSquare, Settings as SettingsIcon, Database } from "lucide-react";
import authStore from "@/lib/auth/auth-store";
import { toast } from "sonner";
import { getStats } from "@/lib/admin-api";

export default function AdminOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    chats: 0,
    messages: 0,
  });

  // Check if user is logged in and is admin
  useEffect(() => {
    async function checkAuth() {
      const user = authStore.getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      if (user.role !== 'ADMIN') {
        toast.error('Access denied. Admin privileges required.');
        router.push('/');
        return;
      }

      // Fetch stats from Supabase
      try {
        const statsData = await getStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex flex-col min-h-screen">
        <div className="animate-pulse flex flex-col space-y-6 mt-8">
          <div className="h-12 bg-slate-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-slate-700 rounded"></div>
            <div className="h-32 bg-slate-700 rounded"></div>
            <div className="h-32 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 flex flex-col min-h-screen">
      <motion.h1
        className="text-3xl font-bold mb-8 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard Overview
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users Stat Card */}
        <motion.div
          className="p-6 rounded-lg border border-blue-500/20 bg-gradient-to-br from-slate-900 to-blue-900/30 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Total Users</h2>
            <div className="p-2 bg-blue-500/20 rounded-full">
              <User className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-4xl font-bold mt-4 text-white">{stats.users}</p>
          <p className="text-blue-300 mt-2 text-sm">Registered accounts</p>
        </motion.div>

        {/* Chats Stat Card */}
        <motion.div
          className="p-6 rounded-lg border border-purple-500/20 bg-gradient-to-br from-slate-900 to-purple-900/30 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Total Chats</h2>
            <div className="p-2 bg-purple-500/20 rounded-full">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-4xl font-bold mt-4 text-white">{stats.chats}</p>
          <p className="text-purple-300 mt-2 text-sm">Chat sessions</p>
        </motion.div>

        {/* Messages Stat Card */}
        <motion.div
          className="p-6 rounded-lg border border-green-500/20 bg-gradient-to-br from-slate-900 to-green-900/30 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Total Messages</h2>
            <div className="p-2 bg-green-500/20 rounded-full">
              <Database className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-4xl font-bold mt-4 text-white">{stats.messages}</p>
          <p className="text-green-300 mt-2 text-sm">Messages exchanged</p>
        </motion.div>
      </div>
    </div>
  );
}
