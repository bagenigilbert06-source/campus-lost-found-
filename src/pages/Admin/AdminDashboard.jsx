import React, { useContext, useState, useEffect, useCallback } from "react";
import { API_BASE } from '../../utils/apiConfig.js';
import { Link } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import {
  FaBoxes,
  FaClipboardList,
  FaCheckCircle,
  FaEnvelope,
  FaPlus,
  FaEye,
  FaUsers,
  FaComments,
  FaArrowRight,
  FaTimesCircle,
  FaClock,
  FaShieldAlt,
  FaChartLine,
} from "react-icons/fa";

import AuthContext from "../../context/Authcontext/AuthContext";
import { schoolConfig } from "../../config/schoolConfig";
import AdminContainer from "../../components/admin/AdminContainer";
import EmptyState from "../../components/admin/EmptyState";
import LoadingState from "../../components/admin/LoadingState";


const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalItems: 0,
    pendingVerification: 0,
    verifiedItems: 0,
    recoveredItems: 0,
    totalUsers: 0,
    unreadMessages: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    activeConversations: 0,
  });

  const [pendingItems, setPendingItems] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeDashboardData = useCallback((payload) => {
    const dashboardStats = payload?.stats || {};
    const dashboardPendingItems = payload?.pendingItems || [];
    const dashboardRecentActivity = payload?.recentActivity || [];

    setStats({
      totalItems: dashboardStats.totalItems || 0,
      pendingVerification: dashboardStats.pendingVerification || 0,
      verifiedItems: dashboardStats.verifiedItems || 0,
      recoveredItems: dashboardStats.recoveredItems || 0,
      totalUsers: dashboardStats.totalUsers || 0,
      unreadMessages: dashboardStats.unreadMessages || 0,
      pendingClaims: dashboardStats.pendingClaims || 0,
      approvedClaims: dashboardStats.approvedClaims || 0,
      rejectedClaims: dashboardStats.rejectedClaims || 0,
      activeConversations: dashboardStats.activeConversations || 0,
    });

    setPendingItems(dashboardPendingItems);
    setRecentActivity(dashboardRecentActivity);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const dashboardRes = await axios.get(`${API_BASE}/items/admin/dashboard`, {
        withCredentials: true,
      });

      if (dashboardRes.data?.success && dashboardRes.data?.data) {
        normalizeDashboardData(dashboardRes.data.data);
        return;
      }

      throw new Error("Invalid dashboard response");
    } catch (error) {
      console.error(
        "[AdminDashboard] Error fetching dashboard data:",
        error?.response?.data || error.message
      );

      try {
        const itemsRes = await axios.get(`${API_BASE}/items`, {
          withCredentials: true,
        });

        const items = itemsRes.data?.data || itemsRes.data || [];

        const pending = items.filter(
          (item) => item.verificationStatus === "pending" || !item.verificationStatus
        );
        const verified = items.filter(
          (item) => item.verificationStatus === "verified"
        );
        const recovered = items.filter((item) => item.status === "recovered");

        setStats({
          totalItems: items.length,
          pendingVerification: pending.length,
          verifiedItems: verified.length,
          recoveredItems: recovered.length,
          totalUsers: new Set(items.map((item) => item.email).filter(Boolean)).size,
          unreadMessages: 0,
          pendingClaims: 0,
          approvedClaims: 0,
          rejectedClaims: 0,
          activeConversations: 0,
        });

        setPendingItems(pending.slice(0, 5));
        setRecentActivity(items.slice(-6).reverse());
      } catch (fallbackError) {
        console.error(
          "[AdminDashboard] Fallback failed:",
          fallbackError?.response?.data || fallbackError.message
        );
        toast.error("Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  }, [normalizeDashboardData]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleVerifyItem = async (itemId) => {
    try {
      await axios.patch(
        `${API_BASE}/items/${itemId}`,
        {
          verificationStatus: "verified",
          verifiedBy: user?.email,
          verifiedAt: new Date().toISOString(),
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Item verified successfully");
      fetchDashboardData();
    } catch (error) {
      console.error(
        "[AdminDashboard] Error verifying item:",
        error?.response?.data || error.message
      );
      toast.error(error?.response?.data?.message || "Failed to verify item");
    }
  };

  const handleRejectItem = async (itemId) => {
    try {
      await axios.patch(
        `${API_BASE}/items/${itemId}`,
        {
          verificationStatus: "rejected",
          verifiedBy: user?.email,
          verifiedAt: new Date().toISOString(),
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Item rejected");
      fetchDashboardData();
    } catch (error) {
      console.error(
        "[AdminDashboard] Error rejecting item:",
        error?.response?.data || error.message
      );
      toast.error(error?.response?.data?.message || "Failed to reject item");
    }
  };

  if (loading) {
    return (
      <AdminContainer>
        <LoadingState type="full" />
      </AdminContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Admin Dashboard | ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <AdminContainer>
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[30px] border border-emerald-300 bg-gradient-to-br from-emerald-700 via-emerald-700 to-green-800">
            <div className="flex flex-col gap-6 px-6 py-7 text-white lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-8">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                  Admin Workspace
                </div>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/90 md:text-base">
                  Monitor the platform, review pending submissions, and manage
                  claims and communication from one organized workspace.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/app/post-item"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-emerald-700"
                >
                  <FaPlus className="text-xs" />
                  Report Item
                </Link>

                <Link
                  to="/admin/inventory"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                >
                  <FaEye className="text-xs" />
                  Manage Inventory
                </Link>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PrimaryStatCard
              title="Pending Review"
              value={stats.pendingVerification}
              subtitle="Items waiting for verification"
              icon={<FaClock />}
              tone="amber"
            />
            <PrimaryStatCard
              title="Verified Items"
              value={stats.verifiedItems}
              subtitle="Approved and verified"
              icon={<FaCheckCircle />}
              tone="emerald"
            />
            <PrimaryStatCard
              title="Pending Claims"
              value={stats.pendingClaims}
              subtitle="Claims awaiting action"
              icon={<FaClipboardList />}
              tone="violet"
            />
            <PrimaryStatCard
              title="Unread Messages"
              value={stats.unreadMessages}
              subtitle="Messages needing review"
              icon={<FaEnvelope />}
              tone="rose"
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[26px] border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Pending Verification
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review the latest items that need admin approval
                  </p>
                </div>

                <Link
                  to="/admin/inventory"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  View All
                  <FaArrowRight className="text-xs" />
                </Link>
              </div>

              <div className="p-5 sm:p-6">
                {pendingItems.length === 0 ? (
                  <EmptyState
                    icon={FaClipboardList}
                    title="All caught up"
                    description="No items are waiting for verification."
                  />
                ) : (
                  <div className="space-y-3">
                    {pendingItems.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-sm font-semibold text-slate-900">
                                {item.title || "Untitled Item"}
                              </h3>
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                {item.verificationStatus || "pending"}
                              </span>
                            </div>

                            <p className="text-sm text-slate-600">
                              {item.location || "Unknown location"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.itemType || "Item"} •{" "}
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString()
                                : "No date"}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() => handleVerifyItem(item._id)}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                            >
                              <FaCheckCircle />
                              Verify
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRejectItem(item._id)}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                            >
                              <FaTimesCircle />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[26px] border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Quick Actions
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Fast access to common admin tasks
                  </p>
                </div>

                <div className="space-y-3 p-5 sm:p-6">
                  <QuickActionCard
                    to="/app/post-item"
                    title="Report New Item"
                    subtitle="Add a lost or found item"
                    icon={<FaPlus className="text-emerald-700" />}
                    tone="emerald"
                  />
                  <QuickActionCard
                    to="/admin/inventory"
                    title="Manage Inventory"
                    subtitle="Review and organize all items"
                    icon={<FaBoxes className="text-blue-700" />}
                    tone="blue"
                  />
                  <QuickActionCard
                    to="/admin/claims"
                    title="Claims & Messages"
                    subtitle="Handle claims and communication"
                    icon={<FaComments className="text-violet-700" />}
                    tone="violet"
                  />
                </div>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Platform totals and summary metrics
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-5 sm:p-6">
                  <MiniMetric label="Total Items" value={stats.totalItems} />
                  <MiniMetric label="Recovered" value={stats.recoveredItems} />
                  <MiniMetric label="Users" value={stats.totalUsers} />
                  <MiniMetric label="Conversations" value={stats.activeConversations} />
                  <MiniMetric label="Approved Claims" value={stats.approvedClaims} />
                  <MiniMetric label="Rejected Claims" value={stats.rejectedClaims} />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-white overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recent Activity
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest updates and recent platform submissions
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <FaChartLine className="text-[11px]" />
                Live overview
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {recentActivity.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  description="Items will appear here as they are reported."
                />
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.title || "Untitled Item"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.itemType || "Item"} • {item.location || "Unknown location"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-[11px] font-semibold",
                            item.verificationStatus === "verified"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.verificationStatus === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700",
                          ].join(" ")}
                        >
                          {item.verificationStatus || "pending"}
                        </span>

                        <Link
                          to={`/items/${item._id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
                        >
                          <FaEye size={13} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </AdminContainer>
    </>
  );
};

function PrimaryStatCard({ title, value, subtitle, icon, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    violet: "bg-violet-50 border-violet-100 text-violet-700",
    rose: "bg-rose-50 border-rose-100 text-rose-700",
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ to, title, subtitle, icon, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 border-emerald-100",
    blue: "bg-blue-50 border-blue-100",
    violet: "bg-violet-50 border-violet-100",
  };

  return (
    <Link
      to={to}
      className={`flex items-center gap-4 rounded-2xl border px-4 py-4 ${tones[tone]}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>

      <FaArrowRight className="text-sm text-slate-400" />
    </Link>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default AdminDashboard;