"use client";

import React, { useRef, useEffect, useMemo } from 'react';
import { useChat } from '@/context/ChatContext';
import MessageBubble from './MessageBubble';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, Sparkles, Zap, Code, Wand2, Stars } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default function ChatMessages() {
  const { currentSessionId, getChatSession } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = getChatSession(currentSessionId);
  // Use useMemo to avoid recreation on every render
  const messages = useMemo(() => currentSession?.messages || [], [currentSession?.messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <motion.div
                className="absolute -inset-4 rounded-full bg-sky-400 opacity-30 blur-xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-900 to-blue-700 border border-sky-400/30 blue-glow"
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Stars className="h-10 w-10 text-sky-200" />
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gradient font-space">Welcome to Double AI</h2>
            <p className="mt-2 text-sky-200">
              Experience the future of artificial intelligence. Double AI is engineered to be more accurate,
              intuitive, and responsive than any other AI assistant.
            </p>
          </motion.div>

          <motion.div
            className="mt-10 grid gap-4 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="rounded-lg border border-sky-500/20 bg-card-gradient p-4 backdrop-blur-md transition-all duration-300 hover:border-sky-400/30 hover:blue-glow">
              <div className="mb-2 flex items-center">
                <div className="mr-3 rounded-md bg-sky-900/80 p-2 border border-sky-500/30">
                  <BrainCircuit className="h-5 w-5 text-sky-400" />
                </div>
                <h3 className="font-medium text-white text-lg">Advanced Knowledge</h3>
              </div>
              <p className="mt-1 text-sm text-sky-200">
                Ask complex questions on any topic and receive detailed, accurate answers with nuanced understanding.
              </p>
            </div>

            <div className="rounded-lg border border-sky-500/20 bg-card-gradient p-4 backdrop-blur-md transition-all duration-300 hover:border-sky-400/30 hover:blue-glow">
              <div className="mb-2 flex items-center">
                <div className="mr-3 rounded-md bg-sky-900/80 p-2 border border-sky-500/30">
                  <Code className="h-5 w-5 text-sky-400" />
                </div>
                <h3 className="font-medium text-white text-lg">Code Generation</h3>
              </div>
              <p className="mt-1 text-sm text-sky-200">
                Generate high-quality code with best practices in multiple programming languages and frameworks.
              </p>
            </div>

            <div className="rounded-lg border border-sky-500/20 bg-card-gradient p-4 backdrop-blur-md transition-all duration-300 hover:border-sky-400/30 hover:blue-glow">
              <div className="mb-2 flex items-center">
                <div className="mr-3 rounded-md bg-sky-900/80 p-2 border border-sky-500/30">
                  <Wand2 className="h-5 w-5 text-sky-400" />
                </div>
                <h3 className="font-medium text-white text-lg">Creative Assistant</h3>
              </div>
              <p className="mt-1 text-sm text-sky-200">
                Get help with writing, brainstorming, and creative tasks with exceptional originality and style.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mx-auto max-w-4xl space-y-6 pt-10">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
