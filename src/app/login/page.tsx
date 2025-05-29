"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import LoginPage from "@/components/auth/LoginPage";
import RegisterPage from "@/components/auth/RegisterPage";
import ResetPasswordPage from "@/components/auth/ResetPasswordPage";

type AuthView = 'login' | 'register' | 'reset-password';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [view, setView] = useState<AuthView>('login');

  const handleLoginSuccess = () => {
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div>
      {view === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onRegisterClick={() => setView('register')}
          onForgotPasswordClick={() => setView('reset-password')}
        />
      )}

      {view === 'register' && (
        <RegisterPage
          onLoginClick={() => setView('login')}
        />
      )}

      {view === 'reset-password' && (
        <ResetPasswordPage
          onLoginClick={() => setView('login')}
        />
      )}
    </div>
  );
}
