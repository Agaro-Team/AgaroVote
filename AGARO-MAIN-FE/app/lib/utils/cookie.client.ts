/**
 * Client-side Cookie Utilities
 *
 * Helper functions to read cookies in the browser
 */

/**
 * Parse a cookie value from document.cookie
 * Handles URL decoding automatically
 *
 * @param name Cookie name
 * @returns Decoded cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];

  if (!cookieValue) {
    return null;
  }

  // Decode URL encoding (e.g., %3D becomes =)
  try {
    return decodeURIComponent(cookieValue);
  } catch (error) {
    console.error(`Failed to decode cookie "${name}":`, error);
    return cookieValue; // Return raw value if decode fails
  }
}

/**
 * Get the authentication token from cookie
 *
 * @returns JWT token or null
 */
export function getAuthToken(): string | null {
  const rawToken = getCookie('agaro_auth_token');

  if (!rawToken) {
    return null;
  }

  // TEMPORARY: Handle legacy base64-encoded tokens from old cookie encryption
  // Check if token looks like base64 (doesn't start with 'eyJ' which is JWT header)
  if (!rawToken.startsWith('eyJ')) {
    console.warn('⚠️ Legacy encrypted cookie detected! Please sign out and sign in again.');
    console.warn(
      'Run this in console to clear: document.cookie = "agaro_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";'
    );

    // Try to decode base64 -> JSON string -> JWT
    try {
      const decoded = atob(rawToken);
      // Remove surrounding quotes if present
      const unquoted =
        decoded.startsWith('"') && decoded.endsWith('"') ? decoded.slice(1, -1) : decoded;

      if (unquoted.startsWith('eyJ')) {
        console.log('✅ Successfully decoded legacy token');
        return unquoted;
      }
    } catch (error) {
      console.error('Failed to decode legacy token:', error);
    }
  }

  return rawToken;
}
