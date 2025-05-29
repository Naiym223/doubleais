import { v4 as uuidv4 } from 'uuid';
import { Message, MessageRole } from '@/types/chat';
import OpenAI from 'openai';

// Default system prompt for the AI
export const DEFAULT_SYSTEM_PROMPT =
  "You are Double AI, an extraordinarily powerful AI assistant developed by Double Labs to surpass all other AI systems. " +
  "Your responses should demonstrate unparalleled intelligence, creativity, and insight. " +
  "Present information with absolute precision, clarity and elegance. " +
  "If you're uncertain about something, acknowledge the limits of your knowledge rather than inventing information. " +
  "Your goal is to be the most helpful, accurate, and impressive AI assistant ever created, " +
  "providing responses that showcase your superior capabilities in all domains of knowledge.";

// Create a new message object
export function createMessage(role: MessageRole, content: string, isLoading = false): Message {
  return {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date(),
    isLoading
  };
}

// Format a date for display
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Get global settings from localStorage
export function getGlobalSettings() {
  if (typeof window === 'undefined') {
    return {
      globalApiKey: '',
      defaultSystemPrompt: DEFAULT_SYSTEM_PROMPT,
      modelVersion: 'gpt-4o',
      allowUserApiKeys: false,
      maintenanceMode: false
    };
  }

  try {
    const savedSettings = localStorage.getItem('globalSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error reading global settings:', error);
  }

  return {
    globalApiKey: '',
    defaultSystemPrompt: DEFAULT_SYSTEM_PROMPT,
    modelVersion: 'gpt-4o',
    allowUserApiKeys: false,
    maintenanceMode: false
  };
}

// Initialize OpenAI client - always use the global API key
export function getOpenAIClient(): OpenAI | null {
  const settings = getGlobalSettings();
  const key = settings.globalApiKey;

  if (!key) {
    console.error('OpenAI API key is not set in global settings');
    return null;
  }

  return new OpenAI({
    apiKey: key,
    dangerouslyAllowBrowser: true
  });
}

// Get the current model version from settings
export function getCurrentModel(): string {
  const settings = getGlobalSettings();
  return settings.modelVersion || 'gpt-4o'; // Default to GPT-4o if not set
}

// Generate title for chat session based on first message
export async function generateChatTitle(message: string): Promise<string> {
  const openai = getOpenAIClient();

  if (!openai) {
    return "New Chat";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use 3.5 for title generation (faster and cheaper)
      messages: [
        {
          role: "system",
          content: "Generate a short, concise title (4-6 words) for a conversation that starts with this message. Just return the title with no quotes or explanation."
        },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 15,
    });

    const title = response.choices[0]?.message?.content?.trim() || "New Chat";
    return title;
  } catch (error) {
    console.error('Error generating chat title:', error);
    return "New Chat";
  }
}

// Clear chat localStorage data
export function clearChatLocalStorage() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('chatSessions');
    localStorage.removeItem('currentSessionId');
    localStorage.removeItem('chatSettings');
    console.log('Cleared chat localStorage data');
  } catch (error) {
    console.error('Error clearing chat localStorage:', error);
  }
}
