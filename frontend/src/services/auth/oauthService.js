/**
 * oauthService.js
 * Dedicated service for Google OAuth API calls.
 * Sends the Google ID token to our backend and retrieves our own JWT.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api';

/**
 * Send the Google ID token to our backend for verification.
 * The backend will verify it against Google's public keys,
 * then find or create a user and return our own JWT.
 *
 * @param {string} idToken - The credential (ID token) returned by Google after sign-in
 * @returns {Promise<{ token: string, user: object, status: string, message: string }>}
 */
export async function googleLogin(idToken) {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data.message || data.error || 'Google sign-in failed. Please try again.';
    throw new Error(message);
  }

  return data;
}
