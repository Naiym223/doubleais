"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/context/ChatContext';
import { PlusIcon, TrashIcon, MessageSquare, X, CpuIcon, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/logo';

export default function Sidebar() {
  const {
    sessions,
    currentSessionId,
    createNewSession,
    deleteSession,
    setCurrentSessionId,
    clearConversation
  } = useChat();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNewChat = () => {
    createNewSession();
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile toggle button */}
      <motion.button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 flex md:hidden h-10 w-10 items-center justify-center rounded-lg bg-sky-900/60 backdrop-blur-md text-white border border-sky-500/30 neon-glow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} className="text-sky-300" />}
      </motion.button>

      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-sky-950/50 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar content */}
      <motion.aside
        className={`
          fixed left-0 top-0 z-40 h-full w-64 bg-opacity-30 backdrop-blur-xl
          bg-gradient-to-b from-sky-950/70 via-blue-900/50 to-sky-950/70
          border-r border-sky-500/20
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        initial={false}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 p-2">
            <Logo size="large" />
          </div>

          <Button
            onClick={handleNewChat}
            className="mb-4 flex w-full items-center gap-2 border-none bg-button-gradient hover:bg-sky-600 transition-all shadow-md neon-glow"
          >
            <PlusIcon className="h-4 w-4" />
            New Chat
          </Button>

          <div className="flex-1 overflow-y-auto py-2 space-y-1">
            <AnimatePresence initial={false}>
              {sessions.map(session => (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`
                      group flex items-center gap-2 rounded-md px-3 py-2 text-sm
                      ${session.id === currentSessionId
                        ? 'bg-sky-500/20 text-white border-l-2 border-sky-400'
                        : 'text-sky-100 hover:bg-sky-800/30'}
                      cursor-pointer transition-all duration-200 ease-in-out
                    `}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <BrainCircuit className={`h-4 w-4 flex-shrink-0 ${session.id === currentSessionId ? 'text-sky-300' : 'text-sky-400'}`} />
                    <span className="flex-1 truncate">{session.title}</span>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-sky-300 hover:text-sky-100 hover:bg-sky-950/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {sessions.length > 0 && currentSessionId && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs border border-sky-500/30 bg-transparent text-sky-300 hover:bg-sky-900/30"
              onClick={clearConversation}
            >
              <TrashIcon className="mr-2 h-3.5 w-3.5" />
              Clear Current Chat
            </Button>
          )}

          <div className="mt-4 border-t border-sky-500/20 pt-4 text-center text-xs text-sky-300/70">
            <p>Double AI v1.0</p>
            <p className="mt-1">© 2025 Double Labs</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
