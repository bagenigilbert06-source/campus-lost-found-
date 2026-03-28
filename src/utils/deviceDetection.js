/**
 * Device Detection Utilities
 * Detects whether user is on mobile or desktop to optimize auth flow
 */

/**
 * Detect if device is mobile/tablet
 * Returns true for phones and tablets, false for desktop
 */
export const isMobileOrTablet = () => {
  // Check user agent for common mobile/tablet patterns
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
};

/**
 * Check if browser supports popup windows
 * Used to detect popup blockers
 */
export const supportsPopup = async () => {
  // Modern browsers support popup opening
  // Actual popup success will be detected at runtime
  return typeof window !== 'undefined' && !!window.open;
};

/**
 * Detect if popup was blocked
 * Returns true if popup is likely blocked
 */
export const isPopupBlocked = (newWindow) => {
  // If window.open returns null or closed immediately, popup is blocked
  if (!newWindow) return true;
  if (newWindow.closed) return true;
  try {
    if (typeof newWindow.closed === 'undefined') return true;
  } catch (e) {
    return true;
  }
  return false;
};

/**
 * Get recommended auth method based on device and browser
 * 'popup' = try popup first, 'redirect' = use redirect
 */
export const getRecommendedAuthMethod = () => {
  if (isMobileOrTablet()) {
    return 'redirect'; // Mobile devices should use redirect
  }
  return 'popup'; // Desktop should try popup
};
