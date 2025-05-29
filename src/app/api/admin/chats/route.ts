import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth-options";

// Get all chats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const userId = searchParams.get("userId") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    let where: any = {};

    // Add search filter
    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Add user filter
    if (userId) {
      where.userId = userId;
    }

    // Get chats with pagination
    const chats = await prisma.chat.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    // Get total count
    const totalChats = await prisma.chat.count({ where });
    const totalPages = Math.ceil(totalChats / limit);

    return NextResponse.json({
      chats,
      pagination: {
        page,
        limit,
        totalChats,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching chats" },
      { status: 500 }
    );
  }
}
