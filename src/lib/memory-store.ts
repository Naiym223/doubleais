"use client";

import { v4 as uuidv4 } from 'uuid';
import { encryptData, decryptData } from '@/lib/auth/crypto';
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/chat-utils';

// Enum for user roles
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// Type definitions
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  password?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
  is_active: boolean;
  is_banned: boolean;
  ban_reason?: string | null;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  preferred_language: string;
  use_personal_api_key: boolean;
  personal_api_key?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  is_deleted: boolean;
}

export interface Message {
  id: string;
  chat_id: string;
  role: string;
  content: string;
  timestamp: string;
}

export interface GlobalSettings {
  id: string;
  global_api_key?: string | null;
  default_system_prompt: string;
  allow_user_api_keys: boolean;
  maintenance_mode: boolean;
  created_at: string;
  updated_at: string;
}

// Memory store class
class MemoryStore {
  private users: Map<string, User> = new Map();
  private userSettings: Map<string, UserSettings> = new Map();
  private chats: Map<string, Chat> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private globalSettings: GlobalSettings | null = null;
  private emailToUserMap: Map<string, string> = new Map();

  constructor() {
    // Initialize global settings
    this.globalSettings = {
      id: uuidv4(),
      default_system_prompt: DEFAULT_SYSTEM_PROMPT,
      allow_user_api_keys: false,
      maintenance_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Create admin user if not exists
    this.createAdminUser();
  }

  private createAdminUser() {
    // Check if admin exists
    for (const user of this.users.values()) {
      if (user.role === UserRole.ADMIN) {
        return;
      }
    }

    // Create admin user
    const adminId = uuidv4();
    const now = new Date().toISOString();

    const admin: User = {
      id: adminId,
      name: "Admin",
      email: "admin@example.com",
      password: "$2b$10$OsLeP0QtBYyLqQhPK1bI0eyk0/p6RejcioBFjmg29tV.V.sMuBpzG", // 'password'
      role: UserRole.ROLE,
      created_at: now,
      updated_at: now,
      is_active: true,
      is_banned: false,
    };

    this.users.set(adminId, admin);
    this.emailToUserMap.set(admin.email || "", adminId);

    // Create settings for admin
    const settingsId = uuidv4();
    const settings: UserSettings = {
      id: settingsId,
      user_id: adminId,
      theme: "dark",
      preferred_language: "en",
      use_personal_api_key: false,
      created_at: now,
      updated_at: now,
    };

    this.userSettings.set(adminId, settings);
  }

  // User methods
  createUser(data: {
    name?: string;
    email: string;
    password: string;
    role?: UserRole;
  }): User {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Check if email already exists
    if (this.emailToUserMap.has(data.email)) {
      throw new Error("Email already in use");
    }

    const user: User = {
      id,
      name: data.name || null,
      email: data.email,
      password: data.password, // Note: Password should be hashed before storage
      role: data.role || UserRole.USER,
      created_at: now,
      updated_at: now,
      is_active: true,
      is_banned: false,
    };

    this.users.set(id, user);
    this.emailToUserMap.set(data.email, id);

    // Create default settings for user
    this.createUserSettings({
      userId: id,
    });

    // Create welcome chat
    this.createChat({
      userId: id,
      title: "Welcome Chat",
    });

    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    const userId = this.emailToUserMap.get(email);
    if (!userId) return undefined;
    return this.users.get(userId);
  }

  updateUser(id: string, data: Partial<Omit<User, "id" | "created_at">>): User {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = {
      ...user,
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.users.set(id, updatedUser);

    // Update email mapping if email changed
    if (data.email && data.email !== user.email) {
      if (user.email) this.emailToUserMap.delete(user.email);
      this.emailToUserMap.set(data.email, id);
    }

    return updatedUser;
  }

  listUsers(page = 1, limit = 10, search?: string): { users: User[]; total: number } {
    let filteredUsers = Array.from(this.users.values());

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchLower) ||
          user.name?.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredUsers.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = filteredUsers.slice(start, end);

    return {
      users: paginatedUsers,
      total,
    };
  }

  // User settings methods
  createUserSettings(data: {
    userId: string;
    theme?: string;
    preferredLanguage?: string;
  }): UserSettings {
    const id = uuidv4();
    const now = new Date().toISOString();

    const settings: UserSettings = {
      id,
      user_id: data.userId,
      theme: data.theme || "dark",
      preferred_language: data.preferredLanguage || "en",
      use_personal_api_key: false,
      created_at: now,
      updated_at: now,
    };

    this.userSettings.set(data.userId, settings);
    return settings;
  }

  getUserSettings(userId: string): UserSettings | undefined {
    return this.userSettings.get(userId);
  }

  updateUserSettings(
    userId: string,
    data: Partial<Omit<UserSettings, "id" | "user_id" | "created_at">>
  ): UserSettings {
    const settings = this.userSettings.get(userId);
    if (!settings) {
      throw new Error("User settings not found");
    }

    // Handle API key encryption
    let apiKey = settings.personal_api_key;
    if (data.personal_api_key !== undefined) {
      if (data.personal_api_key && data.personal_api_key !== "[ENCRYPTED]") {
        apiKey = encryptData(data.personal_api_key);
      }
    }

    const updatedSettings: UserSettings = {
      ...settings,
      ...data,
      personal_api_key: apiKey,
      updated_at: new Date().toISOString(),
    };

    this.userSettings.set(userId, updatedSettings);
    return updatedSettings;
  }

  // Chat methods
  createChat(data: { userId: string; title?: string }): Chat {
    const id = uuidv4();
    const now = new Date().toISOString();

    const chat: Chat = {
      id,
      title: data.title || "New Chat",
      user_id: data.userId,
      created_at: now,
      updated_at: now,
      is_archived: false,
      is_deleted: false,
    };

    this.chats.set(id, chat);
    this.messages.set(id, []); // Initialize empty messages array

    return chat;
  }

  getChatById(id: string): Chat | undefined {
    return this.chats.get(id);
  }

  getUserChats(userId: string, includeDeleted = false): Chat[] {
    return Array.from(this.chats.values()).filter(
      (chat) =>
        chat.user_id === userId &&
        (includeDeleted || !chat.is_deleted)
    ).sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }

  updateChat(
    id: string,
    data: Partial<Omit<Chat, "id" | "user_id" | "created_at">>
  ): Chat {
    const chat = this.chats.get(id);
    if (!chat) {
      throw new Error("Chat not found");
    }

    const updatedChat: Chat = {
      ...chat,
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.chats.set(id, updatedChat);
    return updatedChat;
  }

  listChats(page = 1, limit = 10, search?: string, userId?: string): {
    chats: Chat[];
    total: number;
  } {
    let filteredChats = Array.from(this.chats.values());

    if (userId) {
      filteredChats = filteredChats.filter((chat) => chat.user_id === userId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredChats = filteredChats.filter((chat) =>
        chat.title.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredChats.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedChats = filteredChats
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(start, end);

    return {
      chats: paginatedChats,
      total,
    };
  }

  deleteChat(id: string): boolean {
    const chat = this.chats.get(id);
    if (!chat) return false;

    this.chats.delete(id);
    this.messages.delete(id);
    return true;
  }

  // Message methods
  createMessage(data: { chatId: string; role: string; content: string }): Message {
    const id = uuidv4();
    const now = new Date().toISOString();

    const message: Message = {
      id,
      chat_id: data.chatId,
      role: data.role,
      content: data.content,
      timestamp: now,
    };

    const chatMessages = this.messages.get(data.chatId) || [];
    chatMessages.push(message);
    this.messages.set(data.chatId, chatMessages);

    // Update chat timestamp
    const chat = this.chats.get(data.chatId);
    if (chat) {
      chat.updated_at = now;
      this.chats.set(data.chatId, chat);
    }

    return message;
  }

  getChatMessages(chatId: string): Message[] {
    return (this.messages.get(chatId) || []).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  getRecentMessages(chatId: string, limit = 20): Message[] {
    const messages = this.messages.get(chatId) || [];
    return messages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Global settings methods
  getGlobalSettings(): GlobalSettings {
    if (!this.globalSettings) {
      // Initialize with defaults if not set
      this.globalSettings = {
        id: uuidv4(),
        default_system_prompt: DEFAULT_SYSTEM_PROMPT,
        allow_user_api_keys: false,
        maintenance_mode: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return this.globalSettings;
  }

  updateGlobalSettings(
    data: Partial<Omit<GlobalSettings, "id" | "created_at">>
  ): GlobalSettings {
    if (!this.globalSettings) {
      this.getGlobalSettings(); // Initialize if not exists
    }

    // Handle API key encryption
    let apiKey = this.globalSettings!.global_api_key;
    if (data.global_api_key !== undefined) {
      if (data.global_api_key && data.global_api_key !== "[ENCRYPTED]") {
        apiKey = encryptData(data.global_api_key);
      }
    }

    this.globalSettings = {
      ...this.globalSettings!,
      ...data,
      global_api_key: apiKey,
      updated_at: new Date().toISOString(),
    };

    return this.globalSettings;
  }

  getGlobalApiKey(): string | null {
    const settings = this.getGlobalSettings();
    if (!settings.global_api_key) return null;
    return decryptData(settings.global_api_key);
  }

  getUserApiKey(userId: string): string | null {
    const settings = this.getUserSettings(userId);
    if (!settings || !settings.personal_api_key) return null;
    return decryptData(settings.personal_api_key);
  }
}

// Create a singleton instance
const memoryStore = new MemoryStore();
export default memoryStore;
