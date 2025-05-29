"use client";

import React from 'react';
import { ChatProvider } from '@/context/ChatContext';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

export default function ChatInterface() {
  return (
    <ChatProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden">
        <Sidebar />
        <div className="md:ml-64 flex flex-1 flex-col">
          <Header />
          <div className="relative flex flex-1 flex-col overflow-hidden">
            <ChatMessages />
            <div className="relative">
              {/* Gradient fade at the bottom of messages */}
              <div className="pointer-events-none absolute inset-x-0 bottom-full h-24 bg-gradient-to-t from-blue-950/90 via-blue-950/50 to-transparent"></div>

              {/* Input container */}
              <div className="border-t border-sky-500/20 bg-opacity-40 backdrop-blur-lg bg-gradient-to-r from-sky-950/80 via-blue-900/80 to-sky-950/80 p-4">
                <ChatInput />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
