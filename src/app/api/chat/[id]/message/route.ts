import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth-options";
import { decryptData } from "@/lib/auth/crypto";
import OpenAI from "openai";

// Add a message to a chat and get AI response
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatId = params.id;
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Check if the chat belongs to the user
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get user settings
    const userSettings = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        userSettings: true,
      },
    }).then(user => user?.userSettings);

    // Get global settings for API key and system prompt
    const globalSettings = await prisma.globalSettings.findFirst();

    if (!globalSettings) {
      return NextResponse.json(
        { error: "Global settings not configured" },
        { status: 500 }
      );
    }

    // Determine which API key to use
    let apiKey: string | null = null;

    if (userSettings?.usePersonalApiKey && userSettings?.personalApiKey) {
      // Use personal API key if enabled and available
      apiKey = decryptData(userSettings.personalApiKey);
    } else if (globalSettings.globalApiKey) {
      // Fall back to global API key
      apiKey = decryptData(globalSettings.globalApiKey);
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "No API key available" },
        { status: 500 }
      );
    }

    // Add user message to the database
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        role: "user",
        content,
      },
    });

    // Get previous messages to provide context
    const previousMessages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        timestamp: "asc",
      },
      take: 20, // Limit context size
    });

    // Prepare messages for OpenAI API
    const messages = [
      { role: "system", content: globalSettings.defaultSystemPrompt },
      ...previousMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Get AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use GPT-4o as default
      messages,
      temperature: 0.7,
    });

    const assistantContent = response.choices[0]?.message?.content ||
      "I apologize, but I encountered an issue generating a response.";

    // Add assistant message to the database
    const assistantMessage = await prisma.message.create({
      data: {
        chatId,
        role: "assistant",
        content: assistantContent,
      },
    });

    // Update chat title if this is the first message
    if (previousMessages.length <= 1 && chat.title === "New Chat") {
      try {
        // Generate title based on first message
        const titleResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Generate a very short, concise title (3-5 words) for a conversation that starts with this message. Return only the title text, no quotes or explanation."
            },
            { role: "user", content }
          ],
          temperature: 0.7,
          max_tokens: 10,
        });

        const title = titleResponse.choices[0]?.message?.content?.trim() || "New Chat";

        // Update chat title
        await prisma.chat.update({
          where: { id: chatId },
          data: { title }
        });
      } catch (error) {
        console.error("Error generating title:", error);
        // If title generation fails, just continue
      }
    }

    // Update chat updatedAt timestamp
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "An error occurred while sending message" },
      { status: 500 }
    );
  }
}
