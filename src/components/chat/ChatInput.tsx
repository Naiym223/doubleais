"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/context/ChatContext';
import { motion } from 'framer-motion';
import { SendIcon, Loader2, Sparkles } from 'lucide-react';

export default function ChatInput() {
  const { sendMessage, isProcessing } = useChat();
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Focus textarea on component mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <form
        onSubmit={handleSubmit}
        className={`
          relative flex items-end overflow-hidden rounded-lg
          border border-sky-500/30 bg-sky-900/20 backdrop-blur-lg
          ${isFocused ? 'ring-2 ring-sky-400 ring-opacity-50 border-sky-400/50' : ''}
          transition-all duration-200
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/10 to-blue-800/10 pointer-events-none"></div>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask Double AI anything..."
          className="min-h-[60px] max-h-[200px] flex-1 resize-none border-0 bg-transparent p-4 text-white placeholder-sky-300/70 focus-visible:ring-0 z-10"
        />

        <div className="flex-shrink-0 p-2 z-10">
          <Button
            type="submit"
            size="icon"
            className={`
              h-10 w-10 rounded-lg bg-button-gradient hover:bg-sky-600
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'neon-glow'}
              transition-all duration-300
            `}
            disabled={isProcessing || !input.trim()}
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>

      <div className="mt-2 text-center text-xs text-sky-400/70 flex items-center justify-center">
        <Sparkles className="h-3 w-3 mr-1" />
        <span>Double AI provides advanced responses but may occasionally produce incorrect information</span>
      </div>
    </motion.div>
  );
}
