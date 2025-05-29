"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import {
  getOpenAIClient,
  getCurrentModel,
  DEFAULT_SYSTEM_PROMPT,
  getGlobalSettings
} from '@/lib/chat-utils';
import authStore from '@/lib/auth/auth-store';
import * as firebaseRepo from '@/lib/db/firebase-repository';

// Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSettings {
  temperature: number;
  systemPrompt: string;
}

// Context interface
interface ChatContextProps {
  sessions: ChatSession[];
  currentSessionId: string;
  settings: ChatSettings;
  isProcessing: boolean;
  createNewSession: () => void;
  deleteSession: (sessionId: string) => void;
  setCurrentSessionId: (sessionId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  updateSettings: (newSettings: Partial<ChatSettings>) => void;
  getChatSession: (sessionId: string) => ChatSession | undefined;
  clearConversation: () => void;
}

const defaultSettings: ChatSettings = {
  temperature: 0.7,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
};

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize or load from Firebase/localStorage
  useEffect(() => {
    async function loadUserData() {
      try {
        const user = authStore.getCurrentUser();
        console.log('Current user:', user);

        // Always clear local storage chat sessions to avoid mixing with database data
        localStorage.removeItem('chatSessions');
        localStorage.removeItem('currentSessionId');

        if (!user || !user.id) {
          console.log('No authenticated user, falling back to localStorage');
          loadFromLocalStorage();
          return;
        }

        // Get user's chat sessions from Firebase
        try {
          console.log('Loading chat sessions for user ID:', user.id);
          const chatSessions = await firebaseRepo.getChatSessions(user.id);
          console.log('Loaded chat sessions:', chatSessions);

          if (chatSessions && chatSessions.length > 0) {
            const formattedSessions: ChatSession[] = [];

            // Process each session to get messages
            for (const session of chatSessions) {
              try {
                console.log('Loading messages for session:', session.id);
                const messages = await firebaseRepo.getMessages(session.id);
                console.log(`Loaded ${messages.length} messages for session ${session.id}`);

                formattedSessions.push({
                  id: session.id,
                  title: session.title || 'New Chat',
                  messages: messages.map(msg => ({
                    id: msg.id,
                    role: msg.role as 'user' | 'assistant' | 'system',
                    content: msg.content,
                    timestamp: new Date(msg.timestamp)
                  })),
                  createdAt: new Date(session.created_at),
                  updatedAt: new Date(session.updated_at)
                });
              } catch (err) {
                console.error(`Error loading messages for session ${session.id}:`, err);
              }
            }

            if (formattedSessions.length > 0) {
              // Sort sessions by most recent first
              formattedSessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
              setSessions(formattedSessions);
              setCurrentSessionId(formattedSessions[0].id);
            } else {
              console.log('No valid sessions found, creating a new one');
              createInitialSession(user.id);
            }
          } else {
            console.log('No existing chat sessions, creating a new one');
            createInitialSession(user.id);
          }
        } catch (error) {
          console.error('Error loading chat sessions:', error);
          toast.error('Error loading chats');
          // Fallback to localStorage
          loadFromLocalStorage();
        }

        // Try to load user settings from Firebase
        try {
          const userSettings = await firebaseRepo.getUserSettings(user.id);
          let globalSettings;
          try {
            globalSettings = await firebaseRepo.getGlobalSettings();
          } catch (err) {
            console.error('Error loading global settings:', err);
            globalSettings = { system_prompt: DEFAULT_SYSTEM_PROMPT };
          }

          if (userSettings) {
            setSettings({
              temperature: userSettings.temperature || defaultSettings.temperature,
              systemPrompt: userSettings.system_prompt || globalSettings.system_prompt || DEFAULT_SYSTEM_PROMPT
            });
          } else {
            // If no user settings, use global settings for system prompt
            setSettings({
              ...defaultSettings,
              systemPrompt: globalSettings.system_prompt || DEFAULT_SYSTEM_PROMPT
            });

            // Create user settings if they don't exist
            try {
              await firebaseRepo.updateUserSettings(user.id, {
                temperature: defaultSettings.temperature,
                system_prompt: globalSettings.system_prompt || DEFAULT_SYSTEM_PROMPT
              });
            } catch (err) {
              console.error('Error creating initial user settings:', err);
            }
          }
        } catch (error) {
          console.error('Error loading settings:', error);
          // Keep default settings
        }
      } catch (error) {
        console.error('Error in loadUserData:', error);
        // Fallback to localStorage if anything fails
        loadFromLocalStorage();
      } finally {
        setIsInitialized(true);
      }
    }

    // Fallback to localStorage (used for demo purposes)
    function loadFromLocalStorage() {
      const savedSessions = localStorage.getItem('chatSessions');
      const savedCurrentSessionId = localStorage.getItem('currentSessionId');
      const savedSettings = localStorage.getItem('chatSettings');
      const globalSettings = getGlobalSettings();

      if (savedSessions) {
        const parsedSessions: ChatSession[] = JSON.parse(savedSessions);
        // Convert string timestamps back to Date objects
        const formattedSessions = parsedSessions.map(session => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSessions(formattedSessions);
      }

      if (savedCurrentSessionId) {
        setCurrentSessionId(savedCurrentSessionId);
      } else if (savedSessions && JSON.parse(savedSessions).length > 0) {
        setCurrentSessionId(JSON.parse(savedSessions)[0].id);
      } else {
        createLocalSession();
      }

      if (savedSettings) {
        // Load settings, but use the system prompt from global settings
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({
          ...parsedSettings,
          systemPrompt: globalSettings.defaultSystemPrompt || DEFAULT_SYSTEM_PROMPT
        });
      } else {
        // If no saved settings, use defaults with global system prompt
        setSettings({
          ...defaultSettings,
          systemPrompt: globalSettings.defaultSystemPrompt || DEFAULT_SYSTEM_PROMPT
        });
      }

      setIsInitialized(true);
    }

    // Create a new session in Firebase
    async function createInitialSession(userId: string) {
      try {
        const newSession = await firebaseRepo.createChatSession(userId);

        setSessions([{
          id: newSession.id,
          title: newSession.title,
          messages: [],
          createdAt: new Date(newSession.created_at),
          updatedAt: new Date(newSession.updated_at)
        }]);

        setCurrentSessionId(newSession.id);
      } catch (error) {
        console.error('Error creating initial session:', error);
        createLocalSession();
      }
    }

    // Create a new local session
    function createLocalSession() {
      const newSessionId = uuidv4();
      const newSession: ChatSession = {
        id: newSessionId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSessions([newSession]);
      setCurrentSessionId(newSessionId);
    }

    loadUserData();
  }, []);

  // Save to localStorage when state changes (as fallback)
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('currentSessionId', currentSessionId);
    }
  }, [currentSessionId]);

  useEffect(() => {
    localStorage.setItem('chatSettings', JSON.stringify(settings));
  }, [settings]);

  const getChatSession = (sessionId: string) => {
    return sessions.find(session => session.id === sessionId);
  };

  const createNewSession = async () => {
    const user = authStore.getCurrentUser();
    const newSessionId = uuidv4();
    const now = new Date();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    if (user && user.id) {
      try {
        // Create in Firebase
        const createdSession = await firebaseRepo.createChatSession(user.id);
        newSession.id = createdSession.id;
      } catch (error) {
        console.error('Error creating session in Firebase:', error);
        toast.error('Failed to save chat. Using local session.');
        // Continue with local session
      }
    }

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = async (sessionId: string) => {
    const user = authStore.getCurrentUser();

    // Delete from Firebase if user is logged in
    if (user && user.id) {
      try {
        await firebaseRepo.deleteChatSession(sessionId);
      } catch (error) {
        console.error('Error deleting session in Firebase:', error);
        toast.error('Failed to delete chat from database');
        // Continue with UI update anyway
      }
    }

    // Update state
    setSessions(prev => prev.filter(session => session.id !== sessionId));

    // Handle current session if it was deleted
    if (currentSessionId === sessionId) {
      // Set to first available session or create new one if none left
      if (sessions.length > 1) {
        // Find the next session that's not the current one
        const nextSession = sessions.find(session => session.id !== sessionId);
        if (nextSession) {
          setCurrentSessionId(nextSession.id);
        }
      } else {
        // Create a new session since we deleted the only one
        createNewSession();
      }
    }
  };

  const clearConversation = async () => {
    const user = authStore.getCurrentUser();
    const currentSession = getChatSession(currentSessionId);

    if (!currentSession) return;

    // Create a new version of the session with cleared messages
    const updatedSession: ChatSession = {
      ...currentSession,
      messages: [],
      updatedAt: new Date()
    };

    // Update in Firebase if user is logged in
    if (user && user.id) {
      try {
        // For Firebase, we'll handle by deleting all messages associated with the session
        // This assumes server-side implementation will handle this operation
        await firebaseRepo.deleteChatSession(currentSessionId);
        const newSession = await firebaseRepo.createChatSession(user.id, updatedSession.title);
        updatedSession.id = newSession.id;
      } catch (error) {
        console.error('Error clearing conversation in Firebase:', error);
        toast.error('Failed to clear chat in database');
        // Continue with UI update anyway
      }
    }

    // Update sessions with cleared conversation
    setSessions(prev => prev.map(session =>
      session.id === currentSessionId ? updatedSession : session
    ));
    setCurrentSessionId(updatedSession.id);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isProcessing) return;

    const user = authStore.getCurrentUser();
    const currentSession = getChatSession(currentSessionId);

    if (!currentSession) {
      console.error('No current session found');
      return;
    }

    setIsProcessing(true);

    try {
      // Create user message
      const userMessageId = uuidv4();
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content,
        timestamp: new Date()
      };

      // Prepare assistant message (initially with loading state)
      const assistantMessageId = uuidv4();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true
      };

      // Update session with user message + loading assistant message
      const updatedMessages = [...currentSession.messages, userMessage, assistantMessage];
      const updatedSession = {
        ...currentSession,
        messages: updatedMessages,
        updatedAt: new Date()
      };

      // If this is the first user message, update the title
      const shouldUpdateTitle = currentSession.messages.length === 0 ||
        (currentSession.messages.length === 1 && currentSession.messages[0].role === 'system');

      // Update UI with loading state
      setSessions(prev => prev.map(session =>
        session.id === currentSessionId ? updatedSession : session
      ));

      // If user is signed in, save messages to Firebase
      if (user && user.id) {
        try {
          // Add user message to Firebase
          await firebaseRepo.addMessage(
            currentSessionId,
            userMessage.role,
            userMessage.content
          );

          // Update title if first message
          if (shouldUpdateTitle) {
            await updateSessionTitle(currentSessionId, userMessage.content);
          }
        } catch (error) {
          console.error('Error saving user message to Firebase:', error);
          toast.error('Failed to save message to database');
        }
      }

      // Get AI response
      const openai = getOpenAIClient();
      if (!openai) {
        throw new Error('No OpenAI API key configured');
      }

      // Prepare messages for OpenAI
      const messagesToSend = [
        { role: 'system', content: settings.systemPrompt },
        ...currentSession.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content }
      ];

      // Call OpenAI
      const model = getCurrentModel();
      const response = await openai.chat.completions.create({
        model,
        messages: messagesToSend as any,
        temperature: settings.temperature,
        stream: false,
      });

      // Extract response
      const responseContent = response.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

      // Update assistant message with response
      const finalAssistantMessage: Message = {
        ...assistantMessage,
        content: responseContent,
        isLoading: false
      };

      // Update session with final assistant message
      const finalMessages = [...currentSession.messages, userMessage, finalAssistantMessage];
      const finalSession = {
        ...currentSession,
        messages: finalMessages,
        updatedAt: new Date()
      };

      setSessions(prev => prev.map(session =>
        session.id === currentSessionId ? finalSession : session
      ));

      // Save assistant message to Firebase if user is logged in
      if (user && user.id) {
        try {
          await firebaseRepo.addMessage(
            currentSessionId,
            finalAssistantMessage.role,
            finalAssistantMessage.content
          );
        } catch (error) {
          console.error('Error saving assistant message to Firebase:', error);
          toast.error('Failed to save response to database');
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error getting AI response');

      // Remove loading message and revert to previous state
      setSessions(prev => {
        const session = prev.find(s => s.id === currentSessionId);
        if (!session) return prev;

        // Keep only up to user message (remove loading assistant message)
        const updatedMessages = session.messages.filter(msg => !msg.isLoading);
        return prev.map(s =>
          s.id === currentSessionId
            ? { ...s, messages: updatedMessages }
            : s
        );
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateSettings = async (newSettings: Partial<ChatSettings>) => {
    const user = authStore.getCurrentUser();
    if (user) {
      try {
        await firebaseRepo.updateUserSettings(user.id, {
          temperature: newSettings.temperature,
          system_prompt: newSettings.systemPrompt
        });
      } catch (error) {
        console.error('Error updating settings:', error);
        // Continue anyway as we'll update local state
      }
    }
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateSessionTitle = async (sessionId: string, firstUserMessage: string) => {
    try {
      const openai = getOpenAIClient();
      if (!openai) {
        console.error('No API key set in global settings');
        toast.error('Please set your OpenAI API key in admin settings');
        return;
      }
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Your task is to create a very concise title (4 words max) for a chat based on this first user message. Return only the title, nothing else."
          },
          {
            role: "user",
            content: firstUserMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 20,
      });

      const title = response.choices[0]?.message?.content?.trim() || 'New Chat';

      // Update title in state
      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? { ...session, title }
          : session
      ));

      // Update title in Firebase
      const user = authStore.getCurrentUser();
      if (user) {
        try {
          await firebaseRepo.updateChatSessionTitle(sessionId, title);
        } catch (error) {
          console.error('Error updating session title in Firebase:', error);
        }
      }

      return title;
    } catch (error) {
      console.error('Error generating title:', error);
      return 'New Chat';
    }
  };

  // Return the context provider
  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSessionId,
        settings,
        isProcessing,
        createNewSession,
        deleteSession,
        setCurrentSessionId,
        sendMessage,
        updateSettings,
        getChatSession,
        clearConversation
      }}
    >
      {isInitialized ? children : <div>Loading...</div>}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextProps => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
