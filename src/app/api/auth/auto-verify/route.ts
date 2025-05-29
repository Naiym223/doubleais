import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email/email-service";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const data = await req.json();
    const { userId, email } = data;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔄 Auto-verifying user ${userId} with email ${email || 'unknown'}`);

    // First, check if the user exists in the database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, name, email_verified")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("❌ Error fetching user:", userError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // If user is already verified, no need to do anything
    if (userData.email_verified) {
      console.log(`✅ User ${userId} is already verified`);
      return NextResponse.json({
        message: "User is already verified",
        verified: true
      });
    }

    // Update the user to mark them as verified
    const { error: updateError } = await supabase
      .from("users")
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("❌ Error updating user verification status:", updateError);
      return NextResponse.json(
        { error: "Failed to verify user" },
        { status: 500 }
      );
    }

    console.log(`✅ User ${userId} has been auto-verified`);

    // Send welcome email if we have the email address
    if (userData.email) {
      try {
        const userName = userData.name || userData.email.split('@')[0];
        console.log(`📧 Sending welcome email to ${userData.email}`);
        await sendWelcomeEmail(userData.email, userName);
      } catch (emailError) {
        console.error("❌ Error sending welcome email:", emailError);
        // Don't fail the verification process if welcome email fails
      }
    }

    return NextResponse.json({
      message: "User verified successfully",
      verified: true
    });
  } catch (error) {
    console.error("❌ Error in auto-verify route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
