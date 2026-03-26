import { useContext } from 'react';
import AuthContext from './AuthContext';

/**
 * Custom hook for accessing auth context
 * Provides type-safe access to auth state and methods
 * 
 * @returns {Object} Auth context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
