"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import authStore from '@/lib/auth/auth-store';

// Use dynamic import with no SSR to prevent hydration issues with localStorage
const ChatInterface = dynamic(
  () => import('@/components/chat/ChatInterface'),
  { ssr: false }
);

// Import login page components
const LoginPage = dynamic(
  () => import('@/components/auth/LoginPage'),
  { ssr: false }
);

const RegisterPage = dynamic(
  () => import('@/components/auth/RegisterPage'),
  { ssr: false }
);

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);

  // Check login status when component mounts
  useEffect(() => {
    setIsLoggedIn(authStore.isLoggedIn());
    setLoading(false);
  }, []);

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Toggle between login and register pages
  const toggleAuthMode = () => {
    setShowLogin(!showLogin);
  };

  // Show loading state
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

  // Show login/register pages if not logged in
  if (!isLoggedIn) {
    if (showLogin) {
      return (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onRegisterClick={toggleAuthMode}
        />
      );
    } else {
      return (
        <RegisterPage
          onRegisterSuccess={handleLoginSuccess}
          onLoginClick={toggleAuthMode}
        />
      );
    }
  }

  // If logged in, show the chat interface
  return (
    <main className="flex min-h-screen flex-col">
      <ChatInterface />
    </main>
  );
}
