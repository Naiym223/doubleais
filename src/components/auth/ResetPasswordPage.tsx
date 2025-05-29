"use client";

import React, { useState } from 'react';
import { SymbolIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ResetPasswordPageProps {
  onLoginClick: () => void;
}

export default function ResetPasswordPage({ onLoginClick }: ResetPasswordPageProps) {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    token: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'email') {
      setEmail(value);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    setError("");
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request password reset');
      }

      // Show success message and move to next step
      setSuccessMessage(data.message);
      toast.success(data.message);

      // If in development, show the token for testing
      if (data.resetToken) {
        toast.info(`Development mode: Your reset token is ${data.resetToken}`);
      }

      // Move to confirm step
      setStep('confirm');
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset');
      toast.error(err.message || 'Failed to request password reset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token: formData.token,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Show success message
      setSuccessMessage(data.message);
      toast.success(data.message);

      // After a short delay, redirect to login
      setTimeout(() => {
        onLoginClick();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
      toast.error(err.message || 'Failed to reset password');
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
          <div className="text-xl font-bold text-white">Double AI</div>
        </div>
      </div>

      <main className="flex flex-1 items-center justify-center p-6 pt-20">
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-lg border border-sky-500/30 bg-card-gradient p-8 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-sky-400/30">
            <div className="mx-auto mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-sky-900/70 border border-sky-500/40">
              <SymbolIcon className="h-6 w-6 text-sky-300" />
            </div>

            <h1 className="text-center text-2xl font-bold text-white mb-2">
              {step === 'request' ? 'Reset Your Password' : 'Enter Reset Code'}
            </h1>
            <p className="text-center mb-6 text-sky-300/70">
              {step === 'request'
                ? 'Enter your email to receive a password reset code'
                : 'Check your email for the reset code and enter a new password'}
            </p>

            {error && (
              <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 rounded-md bg-green-500/20 p-3 text-sm text-green-200">
                {successMessage}
              </div>
            )}

            {step === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
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
                    value={email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="border-sky-500/30 bg-sky-900/20 text-white backdrop-blur-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-button-gradient hover:bg-sky-600 border-none neon-glow transition-all duration-300"
                >
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="token"
                    className="block text-sm font-medium text-sky-100"
                  >
                    Reset Code
                  </label>
                  <Input
                    id="token"
                    name="token"
                    type="text"
                    required
                    value={formData.token}
                    onChange={handleChange}
                    placeholder="Enter 6-digit code"
                    className="border-sky-500/30 bg-sky-900/20 text-white backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-sky-100"
                  >
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="border-sky-500/30 bg-sky-900/20 text-white backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-sky-100"
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
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
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}

            <div className="mt-4 text-center text-sm text-sky-300/70">
              <Button
                variant="link"
                onClick={onLoginClick}
                className="text-sky-300 hover:text-sky-100 transition-colors p-0"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
