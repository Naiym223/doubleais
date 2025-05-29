"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SymbolIcon } from "@radix-ui/react-icons";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import authStore from '@/lib/auth/auth-store';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void; // Add this new prop
}

export default function LoginPage({ onLoginSuccess, onRegisterClick, onForgotPasswordClick }: LoginPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check if user was redirected from verification page
  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      toast.success('Email verified successfully! You can now log in');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authStore.login(formData.email, formData.password);
      toast.success("Login successful!");
      onLoginSuccess();
    } catch (err: any) {
      // Special handling for unverified email
      if (err.message && err.message.includes('verify your email')) {
        setError("Your email address has not been verified. Please check your email for the verification code.");

        // Add button to redirect to verification page
        const redirectToVerify = () => {
          router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
        };

        toast.error(
          <div>
            <p>Email not verified</p>
            <Button
              variant="outline"
              size="sm"
              onClick={redirectToVerify}
              className="mt-2 w-full"
            >
              Verify Now
            </Button>
          </div>
        );
      } else {
        setError(err.message || "Failed to log in");
        toast.error(err.message || "Failed to log in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="absolute inset-0 bg-dots-radial opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-small-white/[0.03] pointer-events-none"></div>

      <div className="fixed top-0 left-0 right-0 z-10 border-b border-sky-500/20 bg-opacity-40 backdrop-blur-xl bg-gradient-to-r from-sky-950/80 via-blue-900/80 to-sky-950/80 p-4">
        <div className="container flex justify-between items-center">
          <Logo />
        </div>
      </div>

      <main className="flex flex-1 items-center justify-center p-6 pt-20">
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-lg border border-sky-500/30 bg-card-gradient p-8 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-sky-400/30">
            <div className="mx-auto mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-sky-900/70 border border-sky-500/40">
              <SymbolIcon className="h-6 w-6 text-sky-300" />
            </div>

            <h1 className="text-center text-2xl font-bold text-white mb-2">
              Sign in to Double AI
            </h1>
            <p className="text-center mb-6 text-sky-300/70">
              Enter your credentials to access your account
            </p>

            {error && (
              <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">
                {error}
                {error.includes('email') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/verify?email=${encodeURIComponent(formData.email)}`)}
                    className="mt-2 w-full bg-red-500/20 border-red-400/30 text-red-100 hover:bg-red-500/30"
                  >
                    Go to Verification Page
                  </Button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-sky-100"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="border-sky-500/30 bg-sky-900/20 text-white backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-sky-100"
                  >
                    Password
                  </label>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={onForgotPasswordClick}
                    className="text-sky-300 hover:text-sky-100 transition-colors py-0 h-auto px-0"
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="border-sky-500/30 bg-sky-900/20 text-white backdrop-blur-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-button-gradient hover:bg-sky-600 border-none neon-glow transition-all duration-300"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="mt-4 text-center text-sm text-sky-300/70">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="text-sky-300 hover:text-sky-100 transition-colors"
                >
                  Sign up
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-sky-500/20 text-center text-xs text-sky-300/50">
                <p>Demo Accounts:</p>
                <p className="mt-1">Admin: admin@example.com / admin</p>
                <p className="mt-1">User: user@example.com / user</p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
