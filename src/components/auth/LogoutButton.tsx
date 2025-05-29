"use client";

import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LogoutButtonProps {
  onLogout?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export default function LogoutButton({
  onLogout,
  variant = 'ghost'
}: LogoutButtonProps) {
  const handleLogout = () => {
    // Remove user from localStorage
    localStorage.removeItem('currentUser');

    // Show success message
    toast.success('Logged out successfully');

    // Call the onLogout callback if provided
    if (onLogout) {
      onLogout();
    } else {
      // Refresh the page to reset the app state
      window.location.reload();
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleLogout}
      className="flex items-center gap-2 text-sky-300 hover:text-sky-100"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
}
