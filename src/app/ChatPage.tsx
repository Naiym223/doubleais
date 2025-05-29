"use client";

import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to prevent hydration issues with localStorage
const ChatInterface = dynamic(
  () => import('@/components/chat/ChatInterface'),
  { ssr: false }
);

export default function ChatPage() {
  return <ChatInterface />;
}
