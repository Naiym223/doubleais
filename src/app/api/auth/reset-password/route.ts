import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createHash } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email/email-service";

// Helper function to hash password
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

// Request password reset (sends token to email)
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const data = await req.json();
    const { email } = data;

    // Validate the request body
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log("Password reset requested for email:", email);

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: "If your email is registered, you will receive a password reset link." },
        { status: 200 }
      );
    }

    // Generate token (6-digit code)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Store token in database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        reset_token: resetToken,
        reset_token_expires_at: tokenExpiry.toISOString()
      })
      .eq("id", userData.id);

    if (updateError) {
      console.error("Error storing reset token:", updateError);
      return NextResponse.json(
        { error: "Failed to process password reset" },
        { status: 500 }
      );
    }

    // Send password reset email
    const userName = userData.name || email.split('@')[0];
    console.log(`Sending password reset email to ${email} with token ${resetToken}`);

    await sendPasswordResetEmail(email, userName, resetToken);

    return NextResponse.json({
      message: "If your email is registered, you will receive a password reset link.",
      // Only include token in development for testing
      ...(process.env.NODE_ENV !== "production" && { resetToken })
    });
  } catch (error) {
    console.error("Error in password reset route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Reset password with token
export async function PUT(req: NextRequest) {
  try {
    // Parse the request body
    const data = await req.json();
    const { email, token, newPassword } = data;

    // Validate the request body
    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Email, token, and new password are required" },
        { status: 400 }
      );
    }

    // Check if token is valid
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, reset_token, reset_token_expires_at, name")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Validate token
    if (userData.reset_token !== token) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (new Date(userData.reset_token_expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Reset code has expired" },
        { status: 401 }
      );
    }

    // Hash the new password
    const hashedPassword = hashPassword(newPassword);

    // Update user with new password
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires_at: null
      })
      .eq("id", userData.id);

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Password has been reset successfully"
    });
  } catch (error) {
    console.error("Error in password reset route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
