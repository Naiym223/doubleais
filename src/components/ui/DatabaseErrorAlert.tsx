"use client";

import React, { useState, useEffect } from 'react';
import { validateDatabaseSchema } from '@/lib/firebase-validation';

const DatabaseErrorAlert = () => {
  const [error, setError] = useState<null | { valid: boolean; message: string; missingTables?: string[] }>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const result = await validateDatabaseSchema();

        if (!result.valid) {
          console.error('Database validation failed:', result.message);
          setError(result);
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Error checking database:', err);
        setError({
          valid: false,
          message: 'Could not validate Firebase database schema'
        });
      }
    };

    checkDatabase();
  }, []);

  const dismiss = () => {
    setIsVisible(false);
  };

  if (!error || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 p-4">
      <div className="mx-auto max-w-4xl rounded-lg bg-red-50 p-4 shadow-md border border-red-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">Firebase Database Configuration Issue</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message}</p>

              {error.missingTables && error.missingTables.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Missing Firestore collections:</p>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    {error.missingTables.map(table => (
                      <li key={table}>{table}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 bg-white p-3 rounded border border-red-100">
                <p className="font-semibold">Setup Instructions:</p>
                <ol className="list-decimal list-inside ml-2 mt-1">
                  <li>Go to your Firebase Console: <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.firebase.google.com</a></li>
                  <li>Select your project</li>
                  <li>Navigate to Firestore Database</li>
                  <li>Make sure the database has been created</li>
                  <li>Create the missing collections manually or restart the application which will attempt to create them automatically</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className="inline-flex rounded-md bg-red-50 text-red-500 hover:text-red-600 focus:outline-none"
              onClick={dismiss}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseErrorAlert;
