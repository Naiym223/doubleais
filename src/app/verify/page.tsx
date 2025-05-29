"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SymbolIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { verifyEmail, resendVerificationCode } from "@/lib/supabase";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Get user ID and email from URL params
  const userId = searchParams.get("id");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!userId || !email) {
      router.push("/login");
    }

    // Set up countdown for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [userId, email, router, countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!userId) {
        throw new Error("User ID is missing");
      }

      if (!code || code.length !== 6) {
        throw new Error("Please enter a valid 6-digit verification code");
      }

      await verifyEmail(userId, code);
      toast.success("Email verified successfully!");
      router.push("/login?verified=true");
    } catch (err: any) {
      setError(err.message || "Failed to verify email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || !email) return;

    setIsResending(true);
    setError("");

    try {
      await resendVerificationCode(email);
      toast.success("A new verification code has been sent to your email");
      setCountdown(60); // 60 seconds cooldown
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code");
    } finally {
      setIsResending(false);
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
              Verify Your Email
            </h1>
            <p className="text-center mb-6 text-sky-300/70">
              Please enter the 6-digit code sent to {email}
            </p>

            {error && (
              <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-sky-100"
                >
                  Verification Code
                </label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Enter 6-digit code"
                  className="border-sky-500/30 bg-sky-900/20 text-white backdrop-blur-sm text-center text-xl tracking-widest font-mono"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full bg-button-gradient hover:bg-sky-600 border-none neon-glow transition-all duration-300"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>

              <div className="flex justify-center mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={isResending || countdown > 0}
                  className="text-sm text-sky-300 hover:text-sky-100 transition-colors flex items-center gap-2"
                >
                  {isResending ? (
                    <ReloadIcon className="h-3 w-3 animate-spin" />
                  ) : null}
                  {countdown > 0
                    ? `Resend code in ${countdown}s`
                    : "Didn't receive the code? Resend"}
                </Button>
              </div>

              <div className="mt-4 text-center text-sm text-sky-300/70">
                <Link
                  href="/login"
                  className="text-sky-300 hover:text-sky-100 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
