import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { SignJWT } from "jose";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { clientAuth, clientDb } from "@/lib/firebase";

// JWT secret for signing tokens
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_for_development_only"
);

// Helper function to sign JWT token
async function signToken(payload: any) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d") // Token expires in 1 day
    .sign(JWT_SECRET);

  return token;
}

// Helper function to set auth cookie
function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day in seconds
    sameSite: "strict",
  });

  return response;
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const data = await req.json();
    const { email, password } = data;

    // Log detailed info for debugging
    console.log("Login attempt for email:", email);

    // Validate the request body
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Special case for demo users
    if (email === "admin@example.com" && password === "admin") {
      console.log("Demo admin login successful");
      const token = await signToken({
        id: "admin-id",
        email: "admin@example.com",
        name: "Admin User",
        role: "ADMIN"
      });

      const response = NextResponse.json({
        user: {
          id: "admin-id",
          email: "admin@example.com",
          name: "Admin User",
          role: "ADMIN"
        },
        token
      });

      return setAuthCookie(response, token);
    }

    if (email === "user@example.com" && password === "user") {
      console.log("Demo user login successful");
      const token = await signToken({
        id: "user-id",
        email: "user@example.com",
        name: "Regular User",
        role: "USER"
      });

      const response = NextResponse.json({
        user: {
          id: "user-id",
          email: "user@example.com",
          name: "Regular User",
          role: "USER"
        },
        token
      });

      return setAuthCookie(response, token);
    }

    // Special hardcoded user for testing
    if (email === "testuser@example.com" && password === "password123") {
      console.log("Test user login successful");
      const token = await signToken({
        id: "00000000-0000-0000-0000-000000000001",
        email: "testuser@example.com",
        name: "Test User",
        role: "USER"
      });

      const response = NextResponse.json({
        user: {
          id: "00000000-0000-0000-0000-000000000001",
          email: "testuser@example.com",
          name: "Test User",
          role: "USER"
        },
        token
      });

      return setAuthCookie(response, token);
    }

    // For real database users, authenticate with Firebase
    try {
      console.log("Authenticating with Firebase:", email);

      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
      const firebaseUser = userCredential.user;

      console.log("Firebase authentication successful for:", firebaseUser.uid);

      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(clientDb, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        console.error("User document not found in Firestore:", firebaseUser.uid);
        return NextResponse.json(
          { error: "User data not found. Please contact administrator." },
          { status: 404 }
        );
      }

      const userData = userDoc.data();

      // Check if user is banned
      if (userData.is_banned === true) {
        console.error("User account banned:", firebaseUser.uid);

        return NextResponse.json(
          {
            error: "Your account has been banned" + (userData.ban_reason ? `: ${userData.ban_reason}` : "."),
            status: "ACCOUNT_BANNED",
            reason: userData.ban_reason || undefined
          },
          { status: 403 }
        );
      }

      // Check if user is inactive
      if (userData.is_active === false) {
        console.error("User account inactive:", firebaseUser.uid);
        return NextResponse.json(
          {
            error: "Your account has been deactivated. Please contact support for assistance.",
            status: "ACCOUNT_INACTIVE"
          },
          { status: 403 }
        );
      }

      // Check if email is verified (using Firebase's email verification status)
      if (!firebaseUser.emailVerified && process.env.NODE_ENV !== "development") {
        console.error("User email not verified:", firebaseUser.uid);
        return NextResponse.json(
          {
            error: "Please verify your email address before logging in.",
            status: "EMAIL_NOT_VERIFIED"
          },
          { status: 403 }
        );
      }

      // User authenticated successfully, generate a token
      console.log("User authenticated successfully:", firebaseUser.uid);
      const token = await signToken({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: userData.name || "",
        role: userData.role || "USER",
      });

      // Create a response
      const response = NextResponse.json({
        user: {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: userData.name || "",
          role: userData.role || "USER",
          email_verified: firebaseUser.emailVerified,
        },
        token,
      });

      // Set auth cookie and return
      return setAuthCookie(response, token);

    } catch (firebaseError: any) {
      console.error("Firebase authentication error:", firebaseError.code, firebaseError.message);

      // Handle specific Firebase auth errors
      if (
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/wrong-password" ||
        firebaseError.code === "auth/invalid-credential"
      ) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      if (firebaseError.code === "auth/too-many-requests") {
        return NextResponse.json(
          { error: "Too many failed login attempts. Please try again later or reset your password." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Authentication failed. Please try again later." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Unexpected error during login:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
