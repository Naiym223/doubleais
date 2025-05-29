"use client";

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/context/ChatContext';
import { Settings as SettingsIcon, Sliders, Sparkles, AlertCircle } from 'lucide-react';
import { DEFAULT_SYSTEM_PROMPT, getGlobalSettings } from '@/lib/chat-utils';
import { toast } from 'sonner';

export default function Settings() {
  const { settings, updateSettings } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [globalApiKeySet, setGlobalApiKeySet] = useState(false);
  const [currentModel, setCurrentModel] = useState("");

  // Check if global API key is set
  useEffect(() => {
    const globalSettings = getGlobalSettings();
    setGlobalApiKeySet(!!globalSettings.globalApiKey);
    setCurrentModel(globalSettings.modelVersion || "gpt-4o");
  }, [isOpen]);

  const handleSave = () => {
    updateSettings(localSettings);
    setIsOpen(false);
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    // Get global system prompt
    const globalSettings = getGlobalSettings();
    setLocalSettings(prev => ({
      ...prev,
      systemPrompt: globalSettings.defaultSystemPrompt || DEFAULT_SYSTEM_PROMPT
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-lg text-sky-300 hover:text-sky-100 hover:bg-sky-800/30 border border-sky-500/10"
          onClick={() => {
            setLocalSettings(settings);
          }}
        >
          <Sliders className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="border-sky-500/30 bg-blue-gradient text-white">
        <div className="absolute inset-0 bg-dots-radial opacity-10 pointer-events-none"></div>
        <SheetHeader>
          <SheetTitle className="text-white text-gradient font-space text-2xl">Chat Settings</SheetTitle>
          <SheetDescription className="text-sky-200">
            Configure your AI chat experience
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {!globalApiKeySet && (
            <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-400">API Key Required</h3>
                <p className="text-xs text-red-300/90 mt-1">
                  No global API key is set. Please ask an administrator to set up the API key in the admin settings.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-md bg-sky-900/30 border border-sky-500/20 p-3">
            <h3 className="text-sm font-medium text-sky-300 mb-1">Current Model</h3>
            <p className="text-xs text-sky-200/90">
              {currentModel === "gpt-4o" && "GPT-4o (Latest high-performance model)"}
              {currentModel === "gpt-4-turbo" && "GPT-4 Turbo (High intelligence)"}
              {currentModel === "gpt-3.5-turbo" && "GPT-3.5 Turbo (Fast, affordable)"}
              {!["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"].includes(currentModel) && currentModel}
            </p>
            <p className="text-xs text-sky-300/70 mt-1.5">
              The AI model is configured by your administrator in global settings
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="temperature" className="text-sm font-medium text-sky-100 flex justify-between">
              <span>Response Creativity</span>
              <span className="text-sky-300">{localSettings.temperature.toFixed(1)}</span>
            </label>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-800/30 via-sky-600/30 to-sky-400/30 blur-sm"></div>
              <input
                id="temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={localSettings.temperature}
                onChange={e =>
                  setLocalSettings(prev => ({
                    ...prev,
                    temperature: parseFloat(e.target.value)
                  }))
                }
                className="w-full relative z-10"
              />
            </div>
            <div className="flex justify-between text-xs text-sky-300/70">
              <span>Precise & Deterministic</span>
              <span>Creative & Random</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="systemPrompt" className="text-sm font-medium text-sky-100 flex items-center">
                <Sparkles className="h-4 w-4 mr-1 text-sky-300" />
                <span>System Prompt</span>
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-7 text-xs border-sky-500/30 bg-sky-900/20 text-sky-300 hover:bg-sky-800/30"
              >
                Reset to Default
              </Button>
            </div>
            <Textarea
              id="systemPrompt"
              value={localSettings.systemPrompt}
              onChange={e =>
                setLocalSettings(prev => ({
                  ...prev,
                  systemPrompt: e.target.value
                }))
              }
              className="min-h-[130px] border-sky-500/30 bg-sky-900/20 text-white backdrop-blur-sm"
            />
            <p className="text-xs text-sky-300/70">
              The system prompt defines how the AI responds to your questions
            </p>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-button-gradient hover:bg-sky-600 border-none neon-glow transition-all duration-300 transform hover:scale-102"
          >
            Save Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
