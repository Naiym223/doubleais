"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PersonIcon } from "@radix-ui/react-icons";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      toast.success("Registration successful! Please log in.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Failed to register");
      toast.error(err.message || "Failed to register");
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
              <PersonIcon className="h-6 w-6 text-sky-300" />
            </div>

            <h1 className="text-center text-2xl font-bold text-white mb-2">
              Create an account
            </h1>
            <p className="text-center mb-6 text-sky-300/70">
              Join Double AI to experience next-level intelligence
            </p>

            {error && (
              <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-sky-100"
                >
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="border-sky-500/30 bg-sky-900/20 text-white backdrop-blur-sm"
                />
              </div>

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
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-sky-100"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="border-sky-500/30 bg-sky-900/20 text-white backdrop-blur-sm"
                />
                <p className="text-xs text-sky-300/70">
                  Must be at least 8 characters long
                </p>
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
                  autoComplete="new-password"
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
                {isLoading ? "Creating account..." : "Create account"}
              </Button>

              <div className="mt-4 text-center text-sm text-sky-300/70">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-sky-300 hover:text-sky-100 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
