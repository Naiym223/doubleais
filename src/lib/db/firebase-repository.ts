import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  DocumentData
} from 'firebase/firestore';
import { clientDb } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

// Chat related functions
export async function getChatSessions(userId: string) {
  try {
    const q = query(
      collection(clientDb, 'chat_sessions'),
      where('user_id', '==', userId),
      orderBy('updated_at', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return [];
  }
}

export async function createChatSession(userId: string, title: string = 'New Chat') {
  try {
    // Generate a unique ID
    const sessionId = uuidv4();

    // Create the document with the generated ID
    await setDoc(doc(clientDb, 'chat_sessions', sessionId), {
      id: sessionId,
      user_id: userId,
      title,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    return {
      id: sessionId,
      user_id: userId,
      title,
      // Provide fallback values since serverTimestamp() doesn't return a value immediately
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
}

export async function updateChatSessionTitle(sessionId: string, title: string) {
  try {
    await updateDoc(doc(clientDb, 'chat_sessions', sessionId), {
      title,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating chat session title:', error);
    throw error;
  }
}

export async function deleteChatSession(sessionId: string) {
  try {
    // Delete all messages in the session
    const messagesQuery = query(
      collection(clientDb, 'messages'),
      where('session_id', '==', sessionId)
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    const deletePromises = messagesSnapshot.docs.map(doc =>
      deleteDoc(doc.ref)
    );

    await Promise.all(deletePromises);

    // Delete the session
    await deleteDoc(doc(clientDb, 'chat_sessions', sessionId));
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}

export async function getMessages(sessionId: string) {
  try {
    const q = query(
      collection(clientDb, 'messages'),
      where('session_id', '==', sessionId),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Retrieved ${messages.length} messages`);
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

export async function addMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string) {
  console.log(`🔄 Adding ${role} message to session: ${sessionId} with content length: ${content.length}`);

  try {
    // Special case for demo sessions
    if (sessionId.startsWith('mock-')) {
      console.log(`🔐 Adding mock ${role} message to session: ${sessionId}`);
      const messageId = uuidv4();
      const message = {
        id: messageId,
        session_id: sessionId,
        role,
        content,
        timestamp: new Date().toISOString()
      };

      // Add to localStorage
      const messages = JSON.parse(localStorage.getItem(`messages_${sessionId}`) || '[]');
      messages.push(message);
      localStorage.setItem(`messages_${sessionId}`, JSON.stringify(messages));

      // Update session timestamp
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      const updatedSessions = sessions.map((session: any) =>
        session.id === sessionId ? {...session, updated_at: new Date().toISOString()} : session
      );
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));

      return message;
    }

    // Add new message
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    await setDoc(doc(clientDb, 'messages', messageId), {
      id: messageId,
      session_id: sessionId,
      role,
      content,
      timestamp
    });

    // Update session timestamp
    await updateDoc(doc(clientDb, 'chat_sessions', sessionId), {
      updated_at: serverTimestamp()
    });

    return {
      id: messageId,
      session_id: sessionId,
      role,
      content,
      timestamp
    };
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

// User settings functions
export async function getUserSettings(userId: string) {
  try {
    const docRef = doc(clientDb, 'user_settings', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      // Create default settings if not exists
      const defaultSettings = {
        theme: 'dark',
        notification_enabled: true,
        auto_delete_messages: false,
        message_retention_days: 30
      };

      await setDoc(docRef, {
        user_id: userId,
        ...defaultSettings,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      return { id: userId, user_id: userId, ...defaultSettings };
    }
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
}

export async function updateUserSettings(userId: string, settings: any) {
  try {
    await updateDoc(doc(clientDb, 'user_settings', userId), {
      ...settings,
      updated_at: serverTimestamp()
    });

    return { id: userId, user_id: userId, ...settings };
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
}

// Global settings functions
export async function getGlobalSettings() {
  try {
    const docRef = doc(clientDb, 'global_settings', 'settings');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      // Create default global settings if not exists
      const defaultSettings = {
        maintenance_mode: false,
        new_user_registration_enabled: true,
        max_messages_per_chat: 100,
        max_chats_per_user: 50,
        allowed_roles: ['USER', 'ADMIN']
      };

      await setDoc(docRef, {
        ...defaultSettings,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      return { id: 'settings', ...defaultSettings };
    }
  } catch (error) {
    console.error('Error getting global settings:', error);
    throw error;
  }
}

export async function updateGlobalSettings(settings: any) {
  try {
    await updateDoc(doc(clientDb, 'global_settings', 'settings'), {
      ...settings,
      updated_at: serverTimestamp()
    });

    return { id: 'settings', ...settings };
  } catch (error) {
    console.error('Error updating global settings:', error);
    throw error;
  }
}

// Admin functions
export async function getUsers(limitCount: number = 100) {
  try {
    const q = query(
      collection(clientDb, 'users'),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

export async function getUserById(userId: string) {
  try {
    const docRef = doc(clientDb, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting user with ID ${userId}:`, error);
    return null;
  }
}

export async function updateUser(userId: string, userData: Partial<DocumentData>) {
  try {
    await updateDoc(doc(clientDb, 'users', userId), {
      ...userData,
      updated_at: serverTimestamp()
    });

    return { id: userId, ...userData };
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    // Delete user's chat sessions
    const sessionsQuery = query(
      collection(clientDb, 'chat_sessions'),
      where('user_id', '==', userId)
    );

    const sessionsSnapshot = await getDocs(sessionsQuery);

    // Delete messages for each session
    for (const sessionDoc of sessionsSnapshot.docs) {
      const sessionId = sessionDoc.id;

      // Delete messages
      const messagesQuery = query(
        collection(clientDb, 'messages'),
        where('session_id', '==', sessionId)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      for (const messageDoc of messagesSnapshot.docs) {
        await deleteDoc(messageDoc.ref);
      }

      // Delete the session
      await deleteDoc(sessionDoc.ref);
    }

    // Delete user settings
    await deleteDoc(doc(clientDb, 'user_settings', userId));

    // Delete user
    await deleteDoc(doc(clientDb, 'users', userId));

    return true;
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    throw error;
  }
}
