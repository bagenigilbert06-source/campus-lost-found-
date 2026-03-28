import React, { useEffect, useState, useContext } from 'react';
import { healthChecks, logHealthCheck } from '../utils/healthCheck';
import AuthContext from '../context/Authcontext/AuthContext';

/**
 * System Diagnostics Component
 * Displays Firebase and MongoDB connectivity status
 * Only shows in development mode
 */
const SystemDiagnostics = () => {
  const { user, loading } = useContext(AuthContext);
  const [diagnostics, setDiagnostics] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results = await healthChecks.runAll(user, loading);
      setDiagnostics(results);
      
      // Log to console for debugging
      if (process.env.NODE_ENV === 'development') {
        logHealthCheck(results);
      }
    };

    runDiagnostics();
  }, [user, loading]);

  if (!diagnostics || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const isHealthy = diagnostics.overallStatus === 'HEALTHY';

  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      title="System Diagnostics (Development Only)"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          text-white font-bold text-lg shadow-lg hover:shadow-xl
          transition-all duration-200 cursor-pointer
          ${isHealthy 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-red-500 hover:bg-red-600'
          }
        `}
        title={isHealthy ? 'System is healthy' : 'System issues detected'}
      >
        {isHealthy ? '✅' : '⚠️'}
      </button>

      {expanded && (
        <div 
          className="
            absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-2xl
            border border-gray-200 p-4 max-h-96 overflow-y-auto
          "
        >
          <h3 className="font-bold text-lg mb-3">
            System Diagnostics
            <span className={`ml-2 text-sm font-normal ${
              isHealthy ? 'text-green-600' : 'text-red-600'
            }`}>
              {diagnostics.overallStatus}
            </span>
          </h3>

          {/* Checks */}
          <div className="space-y-2 mb-4">
            <CheckItem 
              label="Firebase Config" 
              status={diagnostics.checks.firebase.status}
              details={diagnostics.checks.firebase.details}
            />
            <CheckItem 
              label="API URL" 
              status={diagnostics.checks.apiUrl.status}
              details={diagnostics.checks.apiUrl.url}
            />
            <CheckItem 
              label="Backend Connection" 
              status={diagnostics.checks.backend.status}
              details={diagnostics.checks.backend.message}
            />
            <CheckItem 
              label="Authentication" 
              status={diagnostics.checks.auth.authenticated ? 'OK' : 'PENDING'}
              details={
                diagnostics.checks.auth.authenticated 
                  ? `Logged in as: ${diagnostics.checks.auth.user.email}`
                  : 'Not authenticated'
              }
            />
          </div>

          {/* Recommendations */}
          {diagnostics.recommendations.length > 0 && (
            <div className="border-t pt-3">
              <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
              <div className="space-y-2">
                {diagnostics.recommendations.map((rec, idx) => (
                  <RecommendationItem key={idx} recommendation={rec} />
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="border-t mt-3 pt-3 text-xs text-gray-500">
            Last updated: {new Date(diagnostics.timestamp).toLocaleTimeString()}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              setExpanded(false);
              window.location.reload();
            }}
            className="
              w-full mt-3 bg-blue-500 text-white py-2 rounded
              hover:bg-blue-600 transition-colors text-sm
            "
          >
            Refresh Page
          </button>
        </div>
      )}
    </div>
  );
};

const CheckItem = ({ label, status, details }) => {
  const isOk = status === 'OK' || status === 'PENDING';
  return (
    <div className="flex items-start gap-2">
      <span className="text-lg mt-0.5">{isOk ? '✅' : '❌'}</span>
      <div className="flex-1">
        <div className="font-semibold text-sm">{label}</div>
        {details && (
          <div className="text-xs text-gray-600 break-words">{details}</div>
        )}
      </div>
    </div>
  );
};

const RecommendationItem = ({ recommendation }) => {
  const iconMap = {
    ERROR: '🔴',
    WARNING: '🟡',
    INFO: 'ℹ️',
  };

  return (
    <div className="text-xs bg-gray-50 p-2 rounded">
      <div className="font-semibold">
        {iconMap[recommendation.level]} {recommendation.level}
      </div>
      <div className="text-gray-700">{recommendation.message}</div>
      <div className="text-gray-600 text-xs mt-1">→ {recommendation.action}</div>
      {recommendation.hint && (
        <div className="text-gray-500 text-xs italic">💡 {recommendation.hint}</div>
      )}
    </div>
  );
};

export default SystemDiagnostics;
