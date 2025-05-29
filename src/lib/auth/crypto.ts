"use client";

import { enc, AES } from 'crypto-js';

// Simple encryption key (this should be stored securely in a real app)
const SECRET_KEY = 'double-ai-encryption-key-2025';

/**
 * Encrypts sensitive data like API keys
 */
export const encryptData = (text: string): string => {
  if (!text) return '';
  try {
    return AES.encrypt(text, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts sensitive data like API keys
 */
export const decryptData = (cipherText: string): string => {
  if (!cipherText) return '';
  try {
    const bytes = AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};
