import { collection, getDocs, query, limit } from 'firebase/firestore';
import { clientDb } from './firebase';

// Required collections for the application
const REQUIRED_COLLECTIONS = [
  'users',
  'chat_sessions',
  'messages',
  'user_settings',
  'global_settings'
];

/**
 * Validates if all required Firestore collections exist
 */
export async function validateDatabaseSchema() {
  try {
    console.log('🔍 Validating Firebase database schema...');

    const missingCollections: string[] = [];

    // Check each required collection
    for (const collectionName of REQUIRED_COLLECTIONS) {
      try {
        const q = query(collection(clientDb, collectionName), limit(1));
        const snapshot = await getDocs(q);
        console.log(`✓ Collection '${collectionName}' exists`);
      } catch (error) {
        console.error(`❌ Error checking collection '${collectionName}':`, error);
        missingCollections.push(collectionName);
      }
    }

    if (missingCollections.length > 0) {
      console.error(`❌ Database schema validation failed. Missing collections: ${missingCollections.join(', ')}`);

      return {
        valid: false,
        missingTables: missingCollections,
        message: `Database schema validation failed. Missing collections: ${missingCollections.join(', ')}. Please ensure all required collections exist in Firestore.`
      };
    }

    console.log('✅ Firebase database schema validation successful!');
    return { valid: true, message: 'Firebase database schema validation successful' };
  } catch (error) {
    console.error('❌ Error validating database schema:', error);
    return {
      valid: false,
      error,
      message: 'Error connecting to Firebase database. Please check your Firebase configuration.'
    };
  }
}
