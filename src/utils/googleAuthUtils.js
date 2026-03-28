/**
 * Google Authentication Utilities
 * Handles smart popup/redirect flow with fallback
 * Production-ready with fallback, error handling, and performance optimization
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { isMobileOrTablet, isPopupBlocked, getRecommendedAuthMethod } from './deviceDetection';

// Track redirect state for debugging and preventing loops
let redirectInProgress = false;

/**
 * Create and configure Google provider with best practices
 * 
 * Note: profile and email scopes are included by default in Firebase Google Auth.
 * This function creates a fresh provider for each sign-in attempt.
 */
export const createGoogleProvider = () => {
  try {
    // Create a new provider instance
    const provider = new GoogleAuthProvider();

    if (!provider) {
      throw new Error('GoogleAuthProvider initialization failed');
    }

    // Configure provider settings for smooth UX
    // This ensures the user sees the account selector dialog
    provider.setCustomParameters({
      prompt: 'select_account', // Always show account selector for clean UX
      login_hint: '', // Don't pre-fill email - let user choose
    });

    // Note: profile and email scopes are already included by default
    // No need to manually add them with addScopes
    // If additional scopes are needed in future, can be added like:
    // provider.addScopes(['scope1', 'scope2']);

    return provider;
  } catch (error) {
    console.error('Failed to create Google Auth provider:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    // Throw the error so calling code can handle it
    throw new Error(`Google Auth initialization failed: ${error.message}`);
  }
};

/**
 * Smart Google Sign-In with popup/redirect fallback
 * 
 * Production-ready flow:
 * 1. Desktop: Try popup for smooth UX (can dismiss and retry)
 * 2. Popup fails → Auto-fallback to redirect (no user action needed)
 * 3. Mobile: Use redirect directly (more reliable)
 * 4. Redirect: User redirected to Google, then back to app
 * 
 * @param {Object} auth - Firebase auth instance
 * @param {Function} onRedirectAttempt - Called when redirect flow is used
 * @returns {Promise} - Resolves to auth result or null if redirect used
 */
export const signInWithGoogleSmartFlow = async (
  auth,
  onRedirectAttempt = () => {}
) => {
  try {
    const provider = createGoogleProvider();
    
    // Validate provider was created correctly
    if (!provider) {
      throw new Error('Failed to initialize Google authentication provider');
    }

    const recommendedMethod = getRecommendedAuthMethod();
    const shouldTryPopup = recommendedMethod === 'popup';

    // Desktop: Try popup first for better UX
    if (shouldTryPopup) {
      try {
        // Attempt popup sign-in
        const result = await signInWithPopup(auth, provider);
        // Success - popup worked
        return result;
      } catch (popupError) {
        // Check if error is due to popup being blocked or user cancelling
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user'
        ) {
          console.warn(
            'Google sign-in popup unavailable:',
            popupError.code,
            '— auto-switching to redirect...'
          );

          // Popup failed - fallback to redirect automatically
          await signInWithRedirect(auth, provider);
          onRedirectAttempt?.();
          redirectInProgress = true;
          return null; // Redirect will return result separately
        }

        // Other errors should be thrown
        throw popupError;
      }
    }

    // Mobile or popup not recommended: Use redirect directly
    console.log('Using redirect flow for Google sign-in');
    await signInWithRedirect(auth, provider);
    onRedirectAttempt?.();
    redirectInProgress = true;
    return null; // Redirect will return result separately
  } catch (error) {
    console.error('Smart Google sign-in error:', error.code || error.message, error);
    redirectInProgress = false;
    throw error;
  }
};

/**
 * Handle Google sign-in redirect result
 * Call this in useEffect to check if user was redirected back from Google
 * 
 * @param {Object} auth - Firebase auth instance
 * @returns {Promise<Object|null>} - Auth result or null if no redirect result
 */
export const handleGoogleSignInRedirectResult = async (auth) => {
  try {
    const result = await getRedirectResult(auth);

    if (result && result.user) {
      // User successfully signed in via redirect
      return result;
    }

    // No redirect result
    return null;
  } catch (error) {
    // Handle redirect errors
    console.error('Google sign-in redirect result error:', error.code, error.message);

    // Common redirect errors:
    if (error.code === 'auth/account-exists-with-different-credential') {
      error.userFriendlyMessage =
        'This email is already registered with a different sign-in method.';
    } else if (error.code === 'auth/auth-domain-config-required') {
      error.userFriendlyMessage =
        'Google Sign-In is not properly configured. Please contact support.';
    } else if (error.code === 'auth/operation-not-allowed') {
      error.userFriendlyMessage = 'Google Sign-In is currently disabled. Try email/password.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      error.userFriendlyMessage = 'Sign-in was cancelled. Please try again.';
    } else {
      error.userFriendlyMessage =
        error.message || 'Failed to complete sign-in. Please try again.';
    }

    throw error;
  }
};

/**
 * Error message mapping for user-friendly error handling
 */
export const getGoogleAuthErrorMessage = (errorCode) => {
  const errorMap = {
    'auth/popup-blocked': 'Pop-up was blocked. Switching to alternative sign-in method...',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/cancelled-popup-request': 'Another sign-in is already in progress.',
    'auth/account-exists-with-different-credential':
      'This email is already registered with a different sign-in method.',
    'auth/auth-domain-config-required':
      'Google Sign-In is not properly configured. Please contact support.',
    'auth/operation-not-allowed': 'Google Sign-In is currently disabled. Try email/password instead.',
    'auth/network-request-failed':
      'Network error. Check your connection and try again.',
    'auth/internal-error':
      'An internal error occurred. Please try again.',
  };

  return errorMap[errorCode] || 'Failed to sign in with Google. Please try again.';
};

/**
 * Check if we're currently in a redirect flow
 * @returns {boolean}
 */
export const isRedirectInProgress = () => redirectInProgress;

/**
 * Clear redirect flag (called after auth result is handled)
 */
export const clearRedirectState = () => {
  redirectInProgress = false;
};
