"use client";

import { useEffect } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased bg-blue-gradient text-white";
  }, []);

  return (
    <body className="antialiased bg-blue-gradient text-white min-h-screen overflow-x-hidden" suppressHydrationWarning>
      {/* Animated background elements */}
      <div className="fixed inset-0 bg-dots-radial opacity-30 pointer-events-none"></div>
      <div className="fixed inset-0 bg-grid-small-white/[0.03] pointer-events-none"></div>

      {/* Gradient overlay */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]"></div>

      {/* Light effects */}
      <div className="fixed top-[-50%] right-0 w-[80%] h-[80%] rounded-full bg-sky-500/10 blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-[-30%] left-0 w-[70%] h-[70%] rounded-full bg-blue-500/20 blur-[100px] opacity-20 pointer-events-none"></div>

      {/* Main content */}
      {children}
    </body>
  );
}
