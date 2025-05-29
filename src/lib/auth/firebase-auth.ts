import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  UserCredential,
  User as FirebaseUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { clientAuth, clientDb, auth as adminAuth, db as adminDb } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'USER';
  is_active: boolean;
  is_banned: boolean;
  email_verified: boolean;
}

/**
 * Register a new user with Firebase Authentication
 */
export async function signUp(email: string, password: string, name: string): Promise<{ user: any; verificationToken: string | null }> {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;

    // Generate a verification token (not needed with Firebase but kept for compatibility)
    const verificationToken = uuidv4();

    // Store additional user data in Firestore
    await setDoc(doc(clientDb, 'users', user.uid), {
      id: user.uid,
      email: user.email,
      name: name,
      role: 'USER',
      is_active: true,
      is_banned: false,
      email_verified: false,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      verification_token: verificationToken
    });

    // Send verification email
    await sendEmailVerification(user);

    return {
      user: {
        id: user.uid,
        email: user.email,
        name: name,
        role: 'USER',
        is_active: true,
        is_banned: false,
        email_verified: false
      },
      verificationToken
    };
  } catch (error: any) {
    console.error('Error in signUp:', error);
    throw error;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<{ user: UserResponse }> {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;

    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(clientDb, 'users', user.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    const userData = userDoc.data();

    // Check if email is verified (optional - Firebase handles this directly)
    if (!user.emailVerified && process.env.NODE_ENV !== 'development') {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    // Check if user is banned
    if (userData.is_banned) {
      throw new Error('Account has been banned');
    }

    // Check if user is active
    if (!userData.is_active) {
      throw new Error('Account is not active');
    }

    // Update last login timestamp
    await updateDoc(doc(clientDb, 'users', user.uid), {
      last_login: serverTimestamp()
    });

    return {
      user: {
        id: user.uid,
        email: user.email as string,
        name: userData.name,
        role: userData.role,
        is_active: userData.is_active,
        is_banned: userData.is_banned,
        email_verified: user.emailVerified
      }
    };
  } catch (error: any) {
    console.error('Error in signIn:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(clientAuth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get the current user data
 */
export async function getCurrentUser(): Promise<UserResponse | null> {
  try {
    const user = clientAuth.currentUser;

    if (!user) {
      return null;
    }

    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(clientDb, 'users', user.uid));

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();

    return {
      id: user.uid,
      email: user.email as string,
      name: userData.name,
      role: userData.role,
      is_active: userData.is_active,
      is_banned: userData.is_banned,
      email_verified: user.emailVerified
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Send a password reset email
 */
export async function sendResetPasswordEmail(email: string): Promise<boolean> {
  try {
    await sendPasswordResetEmail(clientAuth, email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

/**
 * Update user password (requires recent authentication)
 */
export async function updateUserPassword(currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    const user = clientAuth.currentUser;

    if (!user || !user.email) {
      throw new Error('No user is signed in');
    }

    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
}

/**
 * Manually verify a user's email (Admin function)
 */
export async function verifyUserEmail(userId: string): Promise<boolean> {
  try {
    // This requires admin SDK
    if (typeof window !== 'undefined' || !adminAuth) {
      throw new Error('This function can only be called from a server environment');
    }

    // Update the user in Firestore
    await updateDoc(doc(adminDb, 'users', userId), {
      email_verified: true,
      updated_at: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error verifying user email:', error);
    return false;
  }
}
