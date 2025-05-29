// Import the supabase client from the main file
import { supabase } from './supabase';

/**
 * Insert a message using the fixed RPC function
 * This is a simplified version that only handles the message insertion
 */
export async function insertMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
) {
  try {
    console.log(`🔍 Using insert_message RPC function for ${role} message in session ${sessionId}`);

    // Make sure sessionId is a string
    const sessionIdStr = String(sessionId);

    // Call the RPC function
    const { data, error } = await supabase.rpc('insert_message', {
      p_session_id: sessionIdStr,
      p_role: role,
      p_content: content
    });

    if (error) {
      console.error('❌ RPC error in insertMessage:', error);
      return null;
    }

    if (data && data.error) {
      console.error('❌ RPC returned error in response:', data.error);
      return null;
    }

    console.log('✅ Message inserted successfully:', data);
    return data;
  } catch (e) {
    console.error('❌ Exception in insertMessage:', e);
    return null;
  }
}
