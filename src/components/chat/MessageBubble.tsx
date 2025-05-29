"use client";

import React, { useRef, useState } from 'react';
import { Message } from '@/types/chat';
import { formatTime } from '@/lib/chat-utils';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCog, User, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  // Handle copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Animation variants
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: isUser ? 0.95 : 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 1,
        delay: 0.05,
        when: "beforeChildren",
        staggerChildren: 0.07
      }
    }
  };

  const iconVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
      rotate: isUser ? 15 : -15
    },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20,
        delay: isUser ? 0.1 : 0.15
      }
    }
  };

  const bubbleVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      x: isUser ? 20 : -20
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
        mass: 1
      }
    }
  };

  const shimmerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: [0, 0.5, 0],
      scale: [0.9, 1.02, 0.9],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 1
      }
    }
  };

  return (
    <motion.div
      className={`flex w-full gap-3 mb-5 ${isUser ? 'justify-end' : 'justify-start'}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      ref={messageRef}
    >
      {/* AI Avatar */}
      {!isUser && (
        <motion.div
          className="flex-shrink-0 mt-1 relative"
          variants={iconVariants}
        >
          <motion.div
            className="absolute -inset-1 bg-gradient-to-br from-indigo-600/40 to-blue-600/40 rounded-lg blur-md"
            variants={shimmerVariants}
          />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg border border-indigo-400/30 z-10">
            <BrainCog className="h-5 w-5" />
          </div>
        </motion.div>
      )}

      {/* Message content */}
      <div className={`flex max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <motion.div
          variants={bubbleVariants}
          whileHover={{ scale: 1.01 }}
          className={`
            relative rounded-2xl px-4 py-3 shadow-lg
            ${isUser
              ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-tr-sm border border-sky-500/30'
              : 'bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-900/90 text-white rounded-tl-sm border border-slate-700/50 shadow-[0_0_20px_rgba(56,189,248,0.15)]'}
          `}
        >
          {message.isLoading ? (
            <div className="flex items-center space-x-3 py-2 min-w-[100px]">
              <motion.div
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-2.5 w-2.5 rounded-full bg-blue-400"
              />
              <motion.div
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
                className="h-2.5 w-2.5 rounded-full bg-blue-400"
              />
              <motion.div
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
                className="h-2.5 w-2.5 rounded-full bg-blue-400"
              />
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <div className="relative group mt-3 mb-4">
                        <motion.div
                          className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-md blur-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        />
                        <SyntaxHighlighter
                          language={match[1]}
                          style={atomDark}
                          customStyle={{
                            margin: 0,
                            position: 'relative',
                            zIndex: 10,
                            borderRadius: '0.375rem',
                            padding: '1rem',
                            fontSize: '0.875rem',
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(51, 65, 85, 0.5)',
                          }}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                        <motion.div
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                        >
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="p-1.5 rounded-md bg-slate-700/80 text-slate-300 hover:bg-slate-600 transition-colors"
                            title="Copy code"
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </motion.div>
                        {match[1] && (
                          <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="absolute top-2 left-2"
                          >
                            <Badge variant="outline" className="bg-slate-800/80 text-slate-300 border-slate-600/50">
                              {match[1]}
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <code className="bg-slate-800 px-1.5 py-0.5 rounded-md text-sm" {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Glowing accent for non-loading AI messages */}
          {!isUser && !message.isLoading && (
            <motion.div
              className="absolute -bottom-1 -right-1"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-70"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "mirror"
                  }}
                />
                <div className="relative h-3 w-3 bg-blue-400 rounded-full"></div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Message timestamp */}
        <motion.div
          className="mt-1 text-xs text-slate-400 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.3 }}
        >
          {formatTime(message.timestamp)}

          <AnimatePresence>
            {!message.isLoading && !isUser && (
              <motion.button
                onClick={copyToClipboard}
                className={`text-slate-400 hover:text-white transition-colors p-1 rounded-md ${copied ? 'bg-green-500/20' : 'hover:bg-slate-700/50'}`}
                title="Copy message"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.7, scale: 1 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                {copied ?
                  <Check className="h-3.5 w-3.5 text-green-400" /> :
                  <Copy className="h-3.5 w-3.5" />
                }
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* User avatar */}
      {isUser && (
        <motion.div
          className="flex-shrink-0 mt-1"
          variants={iconVariants}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg border border-blue-400/30">
            <User className="h-5 w-5" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
