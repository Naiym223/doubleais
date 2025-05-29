import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    const { data: sessionsData, error: sessionsError } = await supabase
      .from("chat_sessions")
      .select("*")
      .limit(5);

    if (sessionsError) {
      return NextResponse.json({
        status: "error",
        message: "Error querying chat_sessions",
        error: sessionsError
      }, { status: 500 });
    }

    // Test users table
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(5);

    if (usersError) {
      return NextResponse.json({
        status: "error",
        message: "Error querying users",
        error: usersError
      }, { status: 500 });
    }

    // Test messages table
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .limit(5);

    return NextResponse.json({
      status: "success",
      message: "Database connection test successful",
      tables: {
        chat_sessions: {
          exists: true,
          count: sessionsData.length,
          error: null
        },
        users: {
          exists: true,
          count: usersData.length,
          error: null
        },
        messages: {
          exists: messagesError?.code !== "42P01", // Table not found error code
          count: messagesData?.length || 0,
          error: messagesError
        }
      }
    });
  } catch (error) {
    console.error("Error in test route:", error);
    return NextResponse.json({
      status: "error",
      message: "Error testing database connection",
      error: String(error)
    }, { status: 500 });
  }
}
