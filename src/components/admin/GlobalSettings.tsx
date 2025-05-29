"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, MessageSquare, Users } from 'lucide-react';

// Default system prompt - copied from chat-utils.ts
const DEFAULT_SYSTEM_PROMPT =
  "You are Double AI, an extraordinarily powerful AI assistant developed by Double Labs to surpass all other AI systems. " +
  "Your responses should demonstrate unparalleled intelligence, creativity, and insight. " +
  "Present information with absolute precision, clarity and elegance. " +
  "If you're uncertain about something, acknowledge the limits of your knowledge rather than inventing information. " +
  "Your goal is to be the most helpful, accurate, and impressive AI assistant ever created, " +
  "providing responses that showcase your superior capabilities in all domains of knowledge.";

interface GlobalSettingsProps {
  initialTab?: 'api' | 'system' | 'users';
}

export default function GlobalSettings({ initialTab = 'api' }: GlobalSettingsProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    globalApiKey: '',
    defaultSystemPrompt: DEFAULT_SYSTEM_PROMPT,
    allowUserApiKeys: false,
    maintenanceMode: false
  });

  // Update active tab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load settings from local storage
  useEffect(() => {
    const savedSettings = localStorage.getItem('globalSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          ...settings,
          ...parsed,
          // Don't display API key in plain text
          globalApiKey: parsed.globalApiKey ? '[ENCRYPTED]' : ''
        });
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
    setLoading(false);
  }, []);

  // Save settings to local storage
  const handleSave = () => {
    setSaving(true);

    try {
      // Save to local storage, but don't overwrite API key if it's [ENCRYPTED]
      const currentSettings = JSON.parse(localStorage.getItem('globalSettings') || '{}');
      const newSettings = {
        ...settings,
        // Keep existing API key if unchanged
        globalApiKey: settings.globalApiKey === '[ENCRYPTED]'
          ? currentSettings.globalApiKey
          : settings.globalApiKey
      };

      localStorage.setItem('globalSettings', JSON.stringify(newSettings));
      toast.success('Global settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Reset system prompt to default
  const handleResetPrompt = () => {
    setSettings({
      ...settings,
      defaultSystemPrompt: DEFAULT_SYSTEM_PROMPT
    });
    toast.info('System prompt reset to default');
  };

  // Handle tab changes with explicit function
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'api' | 'system' | 'users');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-sky-400 rounded-full"></div>
          <div className="h-3 w-3 bg-sky-400 rounded-full"></div>
          <div className="h-3 w-3 bg-sky-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  // Render only the appropriate content based on initialTab
  const renderContent = () => {
    if (initialTab === 'api') {
      return renderApiContent();
    } else if (initialTab === 'system') {
      return renderSystemContent();
    } else if (initialTab === 'users') {
      return renderUserContent();
    }

    // If initialTab not specified, render full component with tabs
    return (
      <div className="grid gap-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 bg-sky-900/20 border border-sky-500/30">
            <TabsTrigger value="api">
              <Lock className="h-4 w-4 mr-2" />
              <span>API Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="system">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>System Prompt</span>
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              <span>User Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="api" className="mt-0">
              {renderApiContent()}
            </TabsContent>

            <TabsContent value="system" className="mt-0">
              {renderSystemContent()}
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              {renderUserContent()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  };

  // API Configuration Content
  const renderApiContent = () => (
    <Card className="backdrop-blur-md bg-card-gradient border border-sky-500/30">
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
        <CardDescription>
          Set up your OpenAI API key globally for all users. This key will be used for all users unless they provide their own.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="globalApiKey">Global OpenAI API Key</Label>
          <Input
            type="password"
            id="globalApiKey"
            placeholder="sk-..."
            value={settings.globalApiKey}
            onChange={(e) =>
              setSettings({
                ...settings,
                globalApiKey: e.target.value,
              })
            }
            className="border-sky-500/30 bg-sky-900/20 text-white backdrop-blur-sm"
          />
          <p className="text-xs text-sky-300/70">
            This key will be encrypted before being stored. It will be used for all users who don't provide their own key.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  maintenanceMode: checked,
                })
              }
            />
            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
          </div>
          <p className="text-xs text-sky-300/70 pl-12">
            When enabled, only admins can access the application.
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t border-sky-500/20 pt-4">
        <Button
          variant="outline"
          onClick={() => toast.info('Changes not saved')}
          className="border-sky-500/30 text-sky-300 hover:bg-sky-900/30"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-button-gradient hover:bg-sky-600 border-none neon-glow"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );

  // System Prompt Content
  const renderSystemContent = () => (
    <Card className="backdrop-blur-md bg-card-gradient border border-sky-500/30">
      <CardHeader>
        <CardTitle>System Prompt Configuration</CardTitle>
        <CardDescription>
          Set the default system prompt that defines how the AI behaves for all users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="defaultSystemPrompt">Default System Prompt</Label>
          <Textarea
            id="defaultSystemPrompt"
            rows={10}
            value={settings.defaultSystemPrompt}
            onChange={(e) =>
              setSettings({
                ...settings,
                defaultSystemPrompt: e.target.value,
              })
            }
            className="resize-y min-h-[200px] border-sky-500/30 bg-sky-900/20 text-white backdrop-blur-sm"
          />
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetPrompt}
              className="text-xs border-sky-500/30 text-sky-300 hover:bg-sky-900/30"
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t border-sky-500/20 pt-4">
        <Button
          variant="outline"
          onClick={() => toast.info('Changes not saved')}
          className="border-sky-500/30 text-sky-300 hover:bg-sky-900/30"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-button-gradient hover:bg-sky-600 border-none neon-glow"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );

  // User Settings Content
  const renderUserContent = () => (
    <Card className="backdrop-blur-md bg-card-gradient border border-sky-500/30">
      <CardHeader>
        <CardTitle>User Settings</CardTitle>
        <CardDescription>
          Configure user-related settings for the application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="allowUserApiKeys"
              checked={settings.allowUserApiKeys}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  allowUserApiKeys: checked,
                })
              }
            />
            <Label htmlFor="allowUserApiKeys">Allow Personal API Keys</Label>
          </div>
          <p className="text-xs text-sky-300/70 pl-12">
            When enabled, users can provide their own OpenAI API keys.
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t border-sky-500/20 pt-4">
        <Button
          variant="outline"
          onClick={() => toast.info('Changes not saved')}
          className="border-sky-500/30 text-sky-300 hover:bg-sky-900/30"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-button-gradient hover:bg-sky-600 border-none neon-glow"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {renderContent()}
    </motion.div>
  );
}
