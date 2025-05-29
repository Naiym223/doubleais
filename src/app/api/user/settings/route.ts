import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth-options";
import { encryptData } from "@/lib/auth/crypto";

// Get user settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user settings
    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Get global settings to check if personal API keys are allowed
    const globalSettings = await prisma.globalSettings.findFirst();
    const allowUserApiKeys = globalSettings?.allowUserApiKeys || false;

    // If no settings exist, create default settings
    if (!userSettings) {
      const newSettings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        ...newSettings,
        personalApiKey: null,
        allowUserApiKeys,
      });
    }

    // Don't expose the actual API key
    const hasPersonalApiKey = !!userSettings.personalApiKey;

    return NextResponse.json({
      ...userSettings,
      personalApiKey: hasPersonalApiKey ? "[ENCRYPTED]" : null,
      allowUserApiKeys,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching settings" },
      { status: 500 }
    );
  }
}

// Update user settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { theme, preferredLanguage, usePersonalApiKey, personalApiKey } = await req.json();

    // Get global settings to check if personal API keys are allowed
    const globalSettings = await prisma.globalSettings.findFirst();
    const allowUserApiKeys = globalSettings?.allowUserApiKeys || false;

    // Don't allow setting personal API key if not allowed by admin
    if (usePersonalApiKey && !allowUserApiKeys) {
      return NextResponse.json(
        { error: "Personal API keys are not allowed by administrator" },
        { status: 403 }
      );
    }

    // Get existing settings
    const existingSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Process the API key - encrypt it before storing
    let encryptedApiKey = existingSettings?.personalApiKey;
    if (personalApiKey && personalApiKey !== "[ENCRYPTED]") {
      encryptedApiKey = encryptData(personalApiKey);
    }

    // Update or create settings
    let userSettings;
    if (existingSettings) {
      userSettings = await prisma.userSettings.update({
        where: {
          userId: session.user.id,
        },
        data: {
          theme: theme !== undefined ? theme : existingSettings.theme,
          preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : existingSettings.preferredLanguage,
          usePersonalApiKey: allowUserApiKeys ? (usePersonalApiKey !== undefined ? usePersonalApiKey : existingSettings.usePersonalApiKey) : false,
          personalApiKey: allowUserApiKeys ? encryptedApiKey : null,
        },
      });
    } else {
      userSettings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
          theme: theme || "dark",
          preferredLanguage: preferredLanguage || "en",
          usePersonalApiKey: allowUserApiKeys ? !!usePersonalApiKey : false,
          personalApiKey: allowUserApiKeys ? encryptedApiKey : null,
        },
      });
    }

    // Don't expose the actual API key
    const hasPersonalApiKey = !!userSettings.personalApiKey;

    return NextResponse.json({
      ...userSettings,
      personalApiKey: hasPersonalApiKey ? "[ENCRYPTED]" : null,
      allowUserApiKeys,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "An error occurred while updating settings" },
      { status: 500 }
    );
  }
}
