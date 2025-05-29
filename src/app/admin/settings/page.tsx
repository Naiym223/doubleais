"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, MessageSquare, Users, Settings } from "lucide-react";

// Default system prompt
const DEFAULT_SYSTEM_PROMPT =
  "You are Double AI, an extraordinarily powerful AI assistant developed by Double Labs to surpass all other AI systems. " +
  "Your responses should demonstrate unparalleled intelligence, creativity, and insight. " +
  "Present information with absolute precision, clarity and elegance. " +
  "If you're uncertain about something, acknowledge the limits of your knowledge rather than inventing information. " +
  "Your goal is to be the most helpful, accurate, and impressive AI assistant ever created, " +
  "providing responses that showcase your superior capabilities in all domains of knowledge.";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Settings state
  const [apiKey, setApiKey] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [modelVersion, setModelVersion] = useState("gpt-4o"); // Default model
  const [allowUserApiKeys, setAllowUserApiKeys] = useState(false); // This will be disabled
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState("api");

  // Load settings on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("globalSettings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setApiKey(parsed.globalApiKey || "");
        setSystemPrompt(parsed.defaultSystemPrompt || DEFAULT_SYSTEM_PROMPT);
        setModelVersion(parsed.modelVersion || "gpt-4o");
        setAllowUserApiKeys(false); // Always disable this as per requirements
        setMaintenanceMode(!!parsed.maintenanceMode);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    }
  }, []);

  // Save settings
  function saveSettings() {
    setIsLoading(true);

    try {
      const settings = {
        globalApiKey: apiKey,
        defaultSystemPrompt: systemPrompt,
        modelVersion: modelVersion,
        allowUserApiKeys: false, // Always set to false as per requirements
        maintenanceMode: maintenanceMode
      };

      localStorage.setItem("globalSettings", JSON.stringify(settings));
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  }

  // Reset prompt
  function resetPrompt() {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    toast.info("System prompt reset to default");
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Global Settings</h2>
        <p className="text-sky-300/70">Configure system-wide settings for Double AI</p>
      </div>

      {/* Tab Navigation - Stylized buttons for guaranteed clickability */}
      <div className="grid w-full grid-cols-3 bg-sky-900/20 border border-sky-500/30 rounded-md mb-6 overflow-hidden">
        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all ${
            activeTab === "api"
              ? "bg-sky-800/70 text-white shadow-sm border-b-2 border-sky-400"
              : "text-sky-300 hover:bg-sky-800/30 hover:text-white"
          }`}
        >
          <Lock className="h-4 w-4" />
          API Settings
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all ${
            activeTab === "system"
              ? "bg-sky-800/70 text-white shadow-sm border-b-2 border-sky-400"
              : "text-sky-300 hover:bg-sky-800/30 hover:text-white"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          System Prompt
        </button>
        <button
          onClick={() => setActiveTab("advanced")}
          className={`flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all ${
            activeTab === "advanced"
              ? "bg-sky-800/70 text-white shadow-sm border-b-2 border-sky-400"
              : "text-sky-300 hover:bg-sky-800/30 hover:text-white"
          }`}
        >
          <Settings className="h-4 w-4" />
          Advanced
        </button>
      </div>

      <Card className="bg-card-gradient border-sky-500/30">
        {activeTab === "api" && (
          <>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure the global OpenAI API key for all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">Global OpenAI API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your OpenAI API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-1.5 bg-sky-950/40 border-sky-500/30"
                  />
                  <p className="mt-1.5 text-xs text-sky-300/70">
                    This key will be used for all users in the system. Individual user API keys are disabled.
                  </p>
                </div>

                <div>
                  <Label htmlFor="modelVersion">Model Version</Label>
                  <select
                    id="modelVersion"
                    value={modelVersion}
                    onChange={(e) => setModelVersion(e.target.value)}
                    className="w-full mt-1.5 bg-sky-950/40 border-sky-500/30 rounded-md p-2 text-white"
                  >
                    <option value="gpt-4o">GPT-4o (Recommended)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                  <p className="mt-1.5 text-xs text-sky-300/70">
                    Select which OpenAI model to use for all conversations.
                  </p>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {activeTab === "system" && (
          <>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
              <CardDescription>
                Define the personality and behavior of the AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="systemPrompt">Default System Prompt</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetPrompt}
                    className="text-xs text-sky-300 hover:text-sky-100 hover:bg-sky-800/40"
                  >
                    Reset to Default
                  </Button>
                </div>
                <Textarea
                  id="systemPrompt"
                  placeholder="Enter system prompt instructions"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[200px] bg-sky-950/40 border-sky-500/30"
                />
                <p className="text-xs text-sky-300/70">
                  This prompt defines the AI's personality and behavior for all conversations.
                </p>
              </div>
            </CardContent>
          </>
        )}

        {activeTab === "advanced" && (
          <>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure system-wide advanced settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-xs text-sky-300/70">
                    When enabled, only admins can access the system
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              <div className="rounded-md bg-sky-900/30 p-4 border border-sky-500/20">
                <h3 className="text-sm font-medium text-sky-100 mb-2">User API Keys</h3>
                <p className="text-xs text-sky-300/70 mb-3">
                  User API keys are currently disabled. All users will use the global API key configured in API Settings.
                </p>
                <div className="flex items-center opacity-50">
                  <Switch id="allowUserKeys" checked={false} disabled />
                  <Label htmlFor="allowUserKeys" className="ml-2 text-sm text-sky-300/70">
                    Allow User API Keys (Disabled)
                  </Label>
                </div>
              </div>
            </CardContent>
          </>
        )}

        <CardFooter className="flex justify-between border-t border-sky-500/20 pt-6">
          <Button
            variant="outline"
            onClick={() => router.push("/admin")}
            className="border-sky-500/30 text-sky-300 hover:bg-sky-800/30"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={saveSettings}
            disabled={isLoading}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
