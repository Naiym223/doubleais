"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'medium', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-14 h-14',
  };

  const logoSize = sizeClasses[size];
  const textSize = size === 'large' ? 'text-2xl' : size === 'medium' ? 'text-xl' : 'text-lg';

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-sky-400 opacity-20 blur-[10px]"></div>

        {/* Logo container */}
        <div className={`${logoSize} relative flex items-center justify-center rounded-xl border border-sky-500/30 bg-gradient-to-br from-sky-900/60 to-blue-700/40 backdrop-blur-md blue-glow`}>
          {/* Inner elements */}
          <motion.div
            className="absolute w-2/3 h-2/3 rounded-md border border-sky-300/30 bg-sky-500/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/3 h-1/3 rounded-full bg-sky-400 blur-[2px] opacity-80"></div>
          </div>

          <div className="relative z-10 text-sky-100 font-bold">
            D
          </div>
        </div>
      </div>

      {showText && (
        <div className={`ml-2 font-space font-bold ${textSize}`}>
          <span className="text-gradient">Double</span>
          <span className="text-white">AI</span>
        </div>
      )}
    </div>
  );
}
