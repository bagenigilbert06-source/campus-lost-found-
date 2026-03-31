import React, { useContext, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import {
  FaRobot,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaFire,
  FaChartLine,
  FaCoins,
  FaHistory,
} from "react-icons/fa";

import AuthContext from "../../context/Authcontext/AuthContext";
import AdminContainer from "../../components/admin/AdminContainer";
import LoadingState from "../../components/admin/LoadingState";
import EmptyState from "../../components/admin/EmptyState";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

const AIAnalytics = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const [analytics, setAnalytics] = useState(null);
  const [topRoutes, setTopRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(Number(searchParams.get("days")) || 7);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      const token = user?.accessToken || "";
      const response = await axios.get(
        `${API_BASE}/gemini/admin/analytics?days=${selectedDays}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );

      if (response.data?.success && response.data?.data) {
        setAnalytics(response.data.data.summary);
        setTopRoutes(response.data.data.topRoutes || []);
      } else {
        toast.error("Failed to load analytics data");
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
      toast.error(error.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [selectedDays, user]);

  useEffect(() => {
    fetchAnalytics();
    setSearchParams({ days: selectedDays });
  }, [selectedDays, fetchAnalytics, setSearchParams]);

  const StatCard = ({ icon: Icon, label, value, subtext, color = "emerald" }) => (
    <div className={`bg-white rounded-lg border border-${color}-100 p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{label}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        <div className={`text-3xl text-${color}-500`}>
          <Icon />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingState />;
  }

  if (!analytics) {
    return (
      <AdminContainer title="AI Analytics">
        <Helmet>
          <title>AI Analytics - Admin</title>
        </Helmet>
        <EmptyState title="No data available" description="Analytics data is loading..." />
      </AdminContainer>
    );
  }

  return (
    <AdminContainer title="AI Analytics">
      <Helmet>
        <title>AI Analytics - Admin</title>
      </Helmet>

      {/* Header with date selector */}
      <div className="mb-8 flex items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Assistant Analytics</h2>
          <p className="text-sm text-slate-600 mt-1">
            Track Gemini AI performance and usage patterns
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setSelectedDays(days)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                selectedDays === days
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FaRobot}
          label="Total Requests"
          value={analytics.totalRequests || 0}
          subtext={`in last ${selectedDays} days`}
          color="blue"
        />

        <StatCard
          icon={FaCheckCircle}
          label="Success Rate"
          value={`${(analytics.successRate || 0).toFixed(1)}%`}
          subtext={`${analytics.successCount || 0} successful`}
          color="emerald"
        />

        <StatCard
          icon={FaFire}
          label="Rate Limited"
          value={analytics.rateLimitCount || 0}
          subtext="429 errors"
          color="orange"
        />

        <StatCard
          icon={FaClock}
          label="Timeouts"
          value={analytics.timeoutCount || 0}
          subtext="504 errors"
          color="red"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Token Usage */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FaCoins className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-900">Token Usage</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Input Tokens</span>
                <span className="font-semibold text-slate-900">
                  {analytics.totalInputTokens?.toLocaleString() || 0}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (analytics.totalInputTokens || 0) / 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Output Tokens</span>
                <span className="font-semibold text-slate-900">
                  {analytics.totalOutputTokens?.toLocaleString() || 0}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (analytics.totalOutputTokens || 0) / 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Avg Input</span>
                <span className="font-semibold text-slate-900">
                  {analytics.averageInputTokens || 0} tokens
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-600">Avg Output</span>
                <span className="font-semibold text-slate-900">
                  {analytics.averageOutputTokens || 0} tokens
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className="text-emerald-600" />
            <h3 className="text-lg font-semibold text-slate-900">Performance</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Avg Latency</span>
                <span className="font-semibold text-slate-900">
                  {analytics.averageLatencyMs || 0}ms
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (analytics.averageLatencyMs || 0) / 500)}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Gemini</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${
                          analytics.totalRequests > 0
                            ? (analytics.providerBreakdown.gemini / analytics.totalRequests) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 w-12 text-right">
                    {analytics.providerBreakdown.gemini || 0}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Fallback</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${
                          analytics.totalRequests > 0
                            ? (analytics.providerBreakdown.fallback / analytics.totalRequests) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 w-12 text-right">
                    {analytics.providerBreakdown.fallback || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-6">
          <FaHistory className="text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Request Status Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="text-sm text-emerald-700 font-medium mb-1">Success</p>
            <p className="text-2xl font-bold text-emerald-600">
              {analytics.statusBreakdown.success || 0}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              {analytics.totalRequests > 0
                ? ((analytics.statusBreakdown.success / analytics.totalRequests) * 100).toFixed(0)
                : 0}
              %
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-700 font-medium mb-1">Rate Limited</p>
            <p className="text-2xl font-bold text-orange-600">
              {analytics.statusBreakdown.rate_limit || 0}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {analytics.totalRequests > 0
                ? ((analytics.statusBreakdown.rate_limit / analytics.totalRequests) * 100).toFixed(0)
                : 0}
              %
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-700 font-medium mb-1">Timeout</p>
            <p className="text-2xl font-bold text-red-600">
              {analytics.statusBreakdown.timeout || 0}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {analytics.totalRequests > 0
                ? ((analytics.statusBreakdown.timeout / analytics.totalRequests) * 100).toFixed(0)
                : 0}
              %
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-700 font-medium mb-1">Error</p>
            <p className="text-2xl font-bold text-red-600">
              {analytics.statusBreakdown.error || 0}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {analytics.totalRequests > 0
                ? ((analytics.statusBreakdown.error / analytics.totalRequests) * 100).toFixed(0)
                : 0}
              %
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-700 font-medium mb-1">Not Configured</p>
            <p className="text-2xl font-bold text-slate-600">
              {analytics.statusBreakdown.not_configured || 0}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {analytics.totalRequests > 0
                ? ((analytics.statusBreakdown.not_configured / analytics.totalRequests) * 100).toFixed(0)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Top Routes */}
      {topRoutes.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Routes</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Route</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Requests</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Success</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {topRoutes.map((route, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-900 font-medium">{route.route}</td>
                    <td className="text-right py-3 px-4 text-slate-600">{route.requests}</td>
                    <td className="text-right py-3 px-4 text-slate-600">{route.success}</td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              route.successRate >= 80
                                ? "bg-emerald-500"
                                : route.successRate >= 50
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${route.successRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 w-12 text-right">
                          {route.successRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Trend */}
      {analytics.dailyTrend && analytics.dailyTrend.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm mt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Trend</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Requests</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Success</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Errors</th>
                </tr>
              </thead>
              <tbody>
                {analytics.dailyTrend.map((day, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {new Date(day.date).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="text-right py-3 px-4 text-slate-600">{day.requests}</td>
                    <td className="text-right py-3 px-4">
                      <span className="text-emerald-600 font-semibold">{day.success}</span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="text-red-600 font-semibold">{day.errors}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminContainer>
  );
};

export default AIAnalytics;
