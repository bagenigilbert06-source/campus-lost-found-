/**
 * Health Check Utility
 * Validates Firebase and MongoDB connectivity and configuration
 */

export const healthChecks = {
  // Check if Firebase is properly initialized
  firebaseConfig: () => {
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
    ];

    const missing = requiredVars.filter(
      (v) => !import.meta.env[v]
    );

    return {
      status: missing.length === 0 ? 'OK' : 'MISSING',
      details: missing.length === 0 
        ? 'All Firebase environment variables are set'
        : `Missing: ${missing.join(', ')}`,
      missingVars: missing,
    };
  },

  // Check if API URL is configured
  apiUrl: () => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    return {
      status: apiUrl ? 'OK' : 'MISSING',
      url: apiUrl || '/api',
    };
  },

  // Check backend connectivity
  backendConnection: async () => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const backendHost = apiUrl.replace('/api', '');
    try {
      const response = await fetch(`${backendHost}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        return {
          status: 'OK',
          message: 'Backend is running and responsive',
          url: apiUrl.replace('/api', ''),
        };
      } else {
        return {
          status: 'ERROR',
          message: `Backend returned status ${response.status}`,
          url: apiUrl.replace('/api', ''),
        };
      }
    } catch (error) {
      return {
        status: 'ERROR',
        message: `Cannot connect to backend: ${error.message}`,
        url: apiUrl.replace('/api', ''),
        hint: 'Make sure backend server is running on port 3001',
      };
    }
  },

  // Get user authentication status
  authStatus: (user, loading) => {
    return {
      authenticated: !!user,
      loading,
      user: user ? {
        email: user.email,
        displayName: user.displayName,
        uid: user.uid,
        photoURL: user.photoURL,
      } : null,
    };
  },

  // Run all checks
  runAll: async (user, loading) => {
    const firebaseCheck = healthChecks.firebaseConfig();
    const apiUrlCheck = healthChecks.apiUrl();
    const backendCheck = await healthChecks.backendConnection();
    const authCheck = healthChecks.authStatus(user, loading);

    const allOk = firebaseCheck.status === 'OK' && 
                  backendCheck.status === 'OK' &&
                  !loading;

    return {
      timestamp: new Date().toISOString(),
      overallStatus: allOk ? 'HEALTHY' : 'NEEDS_ATTENTION',
      checks: {
        firebase: firebaseCheck,
        apiUrl: apiUrlCheck,
        backend: backendCheck,
        auth: authCheck,
      },
      recommendations: generateRecommendations(
        firebaseCheck,
        backendCheck,
        authCheck
      ),
    };
  },
};

function generateRecommendations(firebaseCheck, backendCheck, authCheck) {
  const recommendations = [];

  if (firebaseCheck.status === 'MISSING') {
    recommendations.push({
      level: 'ERROR',
      message: 'Firebase configuration is incomplete',
      action: `Add missing variables to .env.local: ${firebaseCheck.missingVars.join(', ')}`,
      docs: 'SETUP_GUIDE.md - Part 3: Environment Configuration',
    });
  }

  if (backendCheck.status === 'ERROR') {
    recommendations.push({
      level: 'WARNING',
      message: 'Backend server is not accessible',
      action: 'Make sure backend is running: pnpm run dev:backend',
      hint: backendCheck.hint,
    });
  }

  if (authCheck.loading) {
    recommendations.push({
      level: 'INFO',
      message: 'Authentication is still loading',
      action: 'Wait for auth state to resolve',
    });
  }

  if (!authCheck.authenticated && !authCheck.loading) {
    recommendations.push({
      level: 'INFO',
      message: 'User is not authenticated',
      action: 'Sign in to access protected features',
    });
  }

  return recommendations;
}

/**
 * Log health check results to console with formatting
 */
export const logHealthCheck = (healthStatus) => {
  console.group('%c🏥 Health Check Results', 'color: #1890ff; font-size: 14px; font-weight: bold;');
  
  console.log(`Status: ${healthStatus.overallStatus === 'HEALTHY' ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'}`);
  console.log(`Time: ${healthStatus.timestamp}`);

  console.group('Checks');
  
  Object.entries(healthStatus.checks).forEach(([key, check]) => {
    const statusIcon = check.status === 'OK' ? '✅' : '❌';
    console.log(`${statusIcon} ${key.toUpperCase()}: ${check.status}`);
    if (check.details || check.message || check.url) {
      console.log(`   ${check.details || check.message || check.url}`);
    }
    if (check.missingVars?.length) {
      console.log(`   Missing: ${check.missingVars.join(', ')}`);
    }
  });
  
  console.groupEnd();

  if (healthStatus.recommendations.length > 0) {
    console.group('Recommendations');
    healthStatus.recommendations.forEach((rec) => {
      const icon = rec.level === 'ERROR' ? '🔴' : rec.level === 'WARNING' ? '🟡' : 'ℹ️';
      console.log(`${icon} [${rec.level}] ${rec.message}`);
      console.log(`   Action: ${rec.action}`);
      if (rec.hint) console.log(`   Hint: ${rec.hint}`);
      if (rec.docs) console.log(`   Docs: ${rec.docs}`);
    });
    console.groupEnd();
  }

  console.groupEnd();
};

/**
 * Get a summary for displaying in UI
 */
export const getHealthSummary = (healthStatus) => {
  const { checks } = healthStatus;
  
  return {
    isHealthy: healthStatus.overallStatus === 'HEALTHY',
    firebaseReady: checks.firebase.status === 'OK',
    backendReady: checks.backend.status === 'OK',
    authReady: checks.auth.authenticated || !checks.auth.loading,
    issues: healthStatus.recommendations.filter(r => r.level === 'ERROR'),
    warnings: healthStatus.recommendations.filter(r => r.level === 'WARNING'),
  };
};
