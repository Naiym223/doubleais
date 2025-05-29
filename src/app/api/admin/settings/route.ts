import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth-options";
import { encryptData, decryptData } from "@/lib/auth/crypto";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/chat-utils";

// Get global settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get settings
    let settings = await prisma.globalSettings.findFirst();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: {
          defaultSystemPrompt: DEFAULT_SYSTEM_PROMPT,
          allowUserApiKeys: false,
          maintenanceMode: false,
        },
      });
    }

    // Don't return the actual API key
    const hasApiKey = !!settings.globalApiKey;

    return NextResponse.json({
      ...settings,
      globalApiKey: hasApiKey ? "[ENCRYPTED]" : null,
    });
  } catch (error) {
    console.error("Error fetching global settings:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching settings" },
      { status: 500 }
    );
  }
}

// Update global settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      globalApiKey,
      defaultSystemPrompt,
      allowUserApiKeys,
      maintenanceMode
    } = await req.json();

    // Get existing settings
    let settings = await prisma.globalSettings.findFirst();

    // Process the API key - encrypt it before storing
    let encryptedApiKey = settings?.globalApiKey;
    if (globalApiKey && globalApiKey !== "[ENCRYPTED]") {
      encryptedApiKey = encryptData(globalApiKey);
    }

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: {
          globalApiKey: encryptedApiKey,
          defaultSystemPrompt: defaultSystemPrompt || DEFAULT_SYSTEM_PROMPT,
          allowUserApiKeys: allowUserApiKeys ?? false,
          maintenanceMode: maintenanceMode ?? false,
        },
      });
    } else {
      // Update settings
      settings = await prisma.globalSettings.update({
        where: {
          id: settings.id,
        },
        data: {
          globalApiKey: encryptedApiKey,
          defaultSystemPrompt: defaultSystemPrompt || settings.defaultSystemPrompt,
          allowUserApiKeys: allowUserApiKeys ?? settings.allowUserApiKeys,
          maintenanceMode: maintenanceMode ?? settings.maintenanceMode,
        },
      });
    }

    // Don't return the actual API key
    const hasApiKey = !!settings.globalApiKey;

    return NextResponse.json({
      ...settings,
      globalApiKey: hasApiKey ? "[ENCRYPTED]" : null,
    });
  } catch (error) {
    console.error("Error updating global settings:", error);
    return NextResponse.json(
      { error: "An error occurred while updating settings" },
      { status: 500 }
    );
  }
}
