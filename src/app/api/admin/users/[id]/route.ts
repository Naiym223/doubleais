import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth-options";

// Get specific user details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = params.id;

    // Get user details
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        userSettings: true,
        _count: {
          select: {
            chats: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get recent chats
    const recentChats = await prisma.chat.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    // Include recent chats in response
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        isBanned: user.isBanned,
        banReason: user.banReason,
        chatCount: user._count.chats,
        settings: user.userSettings,
      },
      recentChats,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user details" },
      { status: 500 }
    );
  }
}

// Update a user (ban, change role, etc.)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = params.id;
    const { role, isActive, isBanned, banReason } = await req.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-demotion/banning
    if (userId === session.user.id) {
      if (
        (role && role !== "ADMIN") ||
        isActive === false ||
        isBanned === true
      ) {
        return NextResponse.json(
          { error: "Cannot modify your own admin privileges" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        isBanned: isBanned !== undefined ? isBanned : undefined,
        banReason: banReason !== undefined ? banReason : undefined,
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        isBanned: updatedUser.isBanned,
        banReason: updatedUser.banReason,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "An error occurred while updating user" },
      { status: 500 }
    );
  }
}
