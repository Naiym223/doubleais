import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Create a response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear the auth cookie
    response.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      path: "/",
      maxAge: 0, // Expire immediately
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Error in logout route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
