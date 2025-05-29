import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { clientAuth, clientDb } from "@/lib/firebase";
import { sendVerificationEmailToUser } from "@/lib/email/firebase-email-service";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const data = await req.json();
    const { email, password, name } = data;

    console.log("Registration attempt for email:", email);

    // Validate required fields
    if (!email || !password) {
      console.log("Registration failed: Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Registration failed: Invalid email format");
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists in Firestore
    console.log("Checking if user already exists");

    try {
      const usersRef = collection(clientDb, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("Registration failed: Email already exists");
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }

      // Create the user in Firebase Authentication
      console.log("Creating user in Firebase Authentication");
      const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
      const firebaseUser = userCredential.user;
      const userId = firebaseUser.uid;

      console.log("Generated user ID:", userId);

      // Generate a verification code (for use with custom verification flow if needed)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
      const verificationExpiry = new Date();
      verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hours expiry

      // Create the user profile in Firestore
      console.log("Creating user in Firestore");
      await setDoc(doc(clientDb, "users", userId), {
        id: userId,
        email,
        name: name || email.split('@')[0], // Use part of email as name if not provided
        role: 'USER',
        is_active: true,
        is_banned: false,
        email_verified: false,
        verification_token: verificationCode,
        verification_token_expires_at: verificationExpiry.toISOString(),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Create initial chat session for the user
      console.log("Creating initial chat session");
      const sessionId = uuidv4();
      await setDoc(doc(clientDb, "chat_sessions", sessionId), {
        id: sessionId,
        user_id: userId,
        title: "Welcome Chat",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Send verification email using Firebase's built-in mechanism
      console.log(`Sending verification email to ${email}`);

      // Use Firebase's built-in verification
      await sendEmailVerification(firebaseUser);

      // Return success response
      console.log("User registered successfully:", userId);
      return NextResponse.json({
        message: "User registered successfully. Please check your email for verification instructions.",
        user: {
          id: userId,
          email: email,
          name: name || email.split('@')[0],
        },
        // Only include verification code in development
        ...(process.env.NODE_ENV !== "production" && { verificationCode })
      }, { status: 201 });

    } catch (firebaseError: any) {
      console.error("Firebase error:", firebaseError);

      // Handle Firebase specific errors
      if (firebaseError.code === "auth/email-already-in-use") {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }

      if (firebaseError.code === "auth/invalid-email") {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      if (firebaseError.code === "auth/weak-password") {
        return NextResponse.json(
          { error: "Password is too weak. It should be at least 6 characters." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Registration failed: ${firebaseError.message}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error in register route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
