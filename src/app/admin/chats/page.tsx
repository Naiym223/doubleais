"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatsList from "@/components/admin/ChatsList";
import authStore from "@/lib/auth/auth-store";
import { toast } from "sonner";

export default function AdminChatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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

    setLoading(false);
  }, [router]);

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
    <ChatsList />
  );
}
