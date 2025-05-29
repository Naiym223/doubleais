"use client";

import { useState, useEffect } from "react";

export default function TestSettingsPage() {
  const [activeTab, setActiveTab] = useState("api");
  const [apiKey, setApiKey] = useState("");
  const [allowUserKeys, setAllowUserKeys] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [message, setMessage] = useState("");

  // Function to handle changing tabs
  function handleTabChange(tab: string) {
    setActiveTab(tab);
  }

  // Function to save settings
  function saveSettings() {
    try {
      const settings = {
        apiKey,
        allowUserKeys,
        maintenanceMode
      };

      // Save to localStorage
      localStorage.setItem("test_settings", JSON.stringify(settings));
      setMessage("Settings saved successfully!");
    } catch (error) {
      setMessage("Error saving settings");
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Test Settings Page</h1>

      {message && (
        <div style={{
          padding: "10px",
          marginBottom: "20px",
          backgroundColor: message.includes("Error") ? "#ffcccc" : "#ccffcc",
          borderRadius: "4px"
        }}>
          {message}
        </div>
      )}

      {/* Basic HTML tabs */}
      <div style={{ borderBottom: "1px solid #ddd", marginBottom: "20px" }}>
        <button
          onClick={() => handleTabChange("api")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "api" ? "#4a90e2" : "transparent",
            color: activeTab === "api" ? "white" : "#4a90e2",
            border: "none",
            borderRadius: "4px 4px 0 0",
            cursor: "pointer",
            marginRight: "5px"
          }}
        >
          API Settings
        </button>
        <button
          onClick={() => handleTabChange("permissions")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "permissions" ? "#4a90e2" : "transparent",
            color: activeTab === "permissions" ? "white" : "#4a90e2",
            border: "none",
            borderRadius: "4px 4px 0 0",
            cursor: "pointer"
          }}
        >
          Permissions
        </button>
      </div>

      {/* API Tab Content */}
      {activeTab === "api" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>API Key:</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}
            />
          </div>
        </div>
      )}

      {/* Permissions Tab Content */}
      {activeTab === "permissions" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              <input
                type="checkbox"
                checked={allowUserKeys}
                onChange={() => setAllowUserKeys(!allowUserKeys)}
                style={{ marginRight: "10px" }}
              />
              Allow User API Keys
            </label>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={() => setMaintenanceMode(!maintenanceMode)}
                style={{ marginRight: "10px" }}
              />
              Maintenance Mode
            </label>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={saveSettings}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4a90e2",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "20px"
        }}
      >
        Save Settings
      </button>
    </div>
  );
}
