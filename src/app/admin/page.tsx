"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, MessageSquare, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import authStore from "@/lib/auth/auth-store";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    hasGlobalApiKey: false,
    allowUserApiKeys: false
  });
  const router = useRouter();

  // Check if user is logged in and is admin
  useEffect(() => {
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

    // Get stats from local storage
    const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const chats = JSON.parse(localStorage.getItem('mockChats') || '[]');
    const settings = JSON.parse(localStorage.getItem('globalSettings') || '{}');

    setStats({
      totalUsers: users.length || 3, // Default to 3 for demo
      totalChats: chats.length || 1, // Default to 1 for demo
      hasGlobalApiKey: !!settings.globalApiKey,
      allowUserApiKeys: settings.allowUserApiKeys || false
    });

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="animate-pulse flex space-x-2">
        <div className="h-3 w-3 bg-sky-400 rounded-full"></div>
        <div className="h-3 w-3 bg-sky-400 rounded-full"></div>
        <div className="h-3 w-3 bg-sky-400 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers.toString()}
          description="Active user accounts"
          icon={<User className="h-5 w-5 text-sky-300" />}
        />

        <DashboardCard
          title="Total Chats"
          value={stats.totalChats.toString()}
          description="Active conversations"
          icon={<MessageSquare className="h-5 w-5 text-sky-300" />}
        />

        <DashboardCard
          title="API Key Set"
          value={stats.hasGlobalApiKey ? "Yes" : "No"}
          description="OpenAI API configuration"
          icon={<SettingsIcon className="h-5 w-5 text-sky-300" />}
        />

        <DashboardCard
          title="User API Keys"
          value={stats.allowUserApiKeys ? "Enabled" : "Disabled"}
          description="Personal API keys usage"
          icon={<SettingsIcon className="h-5 w-5 text-sky-300" />}
        />
      </div>

      <div className="mt-8 rounded-lg border border-sky-500/30 bg-card-gradient p-6 backdrop-blur-md">
        <h2 className="text-lg font-medium text-white">Quick Overview</h2>
        <p className="mt-2 text-sky-300/70">
          Welcome to the Double AI Admin Panel. From here you can manage the global API key,
          system prompt, user accounts, and monitor chat activity.
        </p>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      className="rounded-xl border border-sky-500/30 bg-card-gradient p-6 backdrop-blur-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium text-sky-300">{title}</div>
          <div className="mt-2 text-3xl font-bold text-white">{value}</div>
          <div className="mt-1 text-xs text-sky-300/70">{description}</div>
        </div>
        <div className="rounded-full p-2 bg-sky-900/40 border border-sky-500/20">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
