import React, { useContext, useEffect, useMemo, useState } from "react";
import { API_BASE } from '../../utils/apiConfig.js';
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/Authcontext/AuthContext";
import { Helmet } from "react-helmet-async";
import { schoolConfig } from "../../config/schoolConfig";
import toast from "react-hot-toast";
import axios from "axios";
import { itemsService, claimsService, notificationService, messagesService } from "../../services/apiService";
import {
  FaHistory,
  FaBox,
  FaCheckCircle,
  FaComments,
  FaInbox,
} from "react-icons/fa";
import PaginationComponent from "../../components/PaginationComponent";

const ACTIVITIES_PER_PAGE = 10;

const DashboardActivity = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Check user auth and redirect if needed
  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  // Fetch activity data
  useEffect(() => {
    if (!user?.uid || !user?.email) {
      return;
    }

    const fetchActivity = async () => {

      try {
        setLoading(true);

        const [itemsRes, claimsRes, messagesRes, notificationsRes] = await Promise.all([
          itemsService.getUserItems(user?.uid).catch((error) => {
            console.error('[DashboardActivity] Error fetching items:', error);
            return [];
          }),
          claimsService.getClaims(user?.email).catch((error) => {
            console.error('[DashboardActivity] Error fetching claims:', error);
            return [];
          }),
          // Optimize getMessage with limit parameter to reduce payload
          messagesService.getMessages({ limit: 50 }).catch((error) => {
            console.error('[DashboardActivity] Error fetching messages:', error);
            return [];
          }),
          notificationService.getNotifications().catch((error) => {
            console.error('[DashboardActivity] Error fetching notifications:', error);
            return { notifications: [] };
          }),
        ]);


        const items = Array.isArray(itemsRes)
          ? itemsRes
          : itemsRes?.data || [];

        const claims = Array.isArray(claimsRes.data)
          ? claimsRes.data
          : claimsRes.data?.data || [];

        const messages = Array.isArray(messagesRes)
          ? messagesRes
          : [];

      const notifications = Array.isArray(notificationsRes.notifications)
        ? notificationsRes.notifications
        : notificationsRes.data?.notifications || [];

      const allActivities = [
        ...items.map((item) => ({
          id: item._id,
          type: "item",
          title: item.title || "Item posted",
          description: `Posted ${item.itemType || "item"} ${item.subType ? `(${item.subType})` : ""} in ${item.category || ""}`,
          icon: FaBox,
          tone: "emerald",
          date: item.createdAt,
          details: item.category ? `Category: ${item.category}` : "Item update",
        })),
        ...claims.map((claim) => ({
          id: claim._id,
          type: "claim",
          title: claim.itemTitle || "Claim activity",
          description: `Claim ${claim.status || "updated"}`,
          icon: FaCheckCircle,
          tone:
            claim.status === "approved"
              ? "green"
              : claim.status === "rejected"
              ? "red"
              : "amber",
          date: claim.createdAt,
          details: `Status: ${claim.status || "Pending"}`,
        })),
        ...messages.map((message) => ({
          id: message._id,
          type: "message",
          title: message.senderName || "New message",
          description: `Message from ${message.senderName || message.senderEmail}`,
          icon: FaComments,
          tone: message.isRead ? "slate" : "blue",
          date: message.createdAt,
          details: message.content ? message.content.substring(0, 50) + "..." : "New message",
        })),
        ...notifications.map((notif) => ({
          id: notif._id,
          type: "notification",
          title: notif.title || "Notification",
          description: notif.message,
          icon: FaInbox,
          tone: "blue",
          date: notif.createdAt,
          details: notif.type ? `Type: ${notif.type}` : "Update",
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setActivities(allActivities);
    } catch (error) {
      console.error("[DashboardActivity] Error fetching activities:", error);
      toast.error("Failed to load activity history");
    } finally {
      setLoading(false);
    }
    };

    fetchActivity();
  }, [user?.uid, user?.email]);

  const filteredActivities = useMemo(() => {
    if (filter === "all") return activities;
    return activities.filter((activity) => activity.type === filter);
  }, [activities, filter]);

  const totalPages = Math.ceil(filteredActivities.length / ACTIVITIES_PER_PAGE);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * ACTIVITIES_PER_PAGE,
    currentPage * ACTIVITIES_PER_PAGE
  );

  const stats = useMemo(
    () => ({
      total: activities.length,
      items: activities.filter((a) => a.type === "item").length,
      claims: activities.filter((a) => a.type === "claim").length,
      messages: activities.filter((a) => a.type === "message").length,
    }),
    [activities]
  );

  const filterButtons = [
    { id: "all", label: "All Activities", icon: FaHistory },
    { id: "item", label: "Items", icon: FaBox },
    { id: "claim", label: "Claims", icon: FaCheckCircle },
    { id: "message", label: "Messages", icon: FaComments },
  ];

  return (
    <>
      <Helmet>
        <title>{`Activity - ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <div className="min-h-screen bg-[#f7f8fa] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Hero */}
          <section className="mb-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-5 shadow-sm sm:mb-8 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Activity Overview
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                  Activity History
                </h1>

                <p className="mt-2 text-sm leading-6 text-emerald-900/80 sm:text-base">
                  View your recent items, claims, and messages in one clean and
                  organized timeline.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="Total" value={stats.total} />
                <MiniStat label="Items" value={stats.items} />
                <MiniStat label="Claims" value={stats.claims} />
                <MiniStat label="Messages" value={stats.messages} />
              </div>
            </div>
          </section>

          {/* Main stats cards */}
          <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 sm:mb-8">
            <StatCard
              label="Total Activities"
              value={stats.total}
              icon={FaHistory}
              tone="emerald"
            />
            <StatCard
              label="Items Posted"
              value={stats.items}
              icon={FaBox}
              tone="emerald"
            />
            <StatCard
              label="Claims"
              value={stats.claims}
              icon={FaCheckCircle}
              tone="green"
            />
            <StatCard
              label="Messages"
              value={stats.messages}
              icon={FaComments}
              tone="blue"
            />
          </section>

          {/* Filters */}
          <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-8 sm:p-5">
            <div className="flex flex-wrap gap-3">
              {filterButtons.map((btn) => {
                const BtnIcon = btn.icon;
                const active = filter === btn.id;

                return (
                  <button
                    key={btn.id}
                    onClick={() => {
                      setFilter(btn.id);
                      setCurrentPage(1);
                    }}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold ${
                      active
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                    type="button"
                  >
                    <BtnIcon className="h-4 w-4" />
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Activity list */}
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <LoadingRow key={index} />
                ))}
              </div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <FaInbox className="text-2xl text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                No activity yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your recent items, claims, and messages will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {paginatedActivities.map((activity, index) => (
                  <ActivityRow
                    key={`${activity.type || 'activity'}-${index}`}
                    activity={activity}
                    isLast={index === paginatedActivities.length - 1}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredActivities.length}
                  itemsPerPage={ACTIVITIES_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

const toneMap = {
  emerald: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
    iconSolid: "bg-emerald-600",
    valueColor: "text-slate-900",
  },
  green: {
    iconBg: "bg-green-50",
    iconColor: "text-green-700",
    iconSolid: "bg-green-600",
    valueColor: "text-slate-900",
  },
  blue: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    iconSolid: "bg-blue-600",
    valueColor: "text-slate-900",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
    iconSolid: "bg-amber-600",
    valueColor: "text-slate-900",
  },
  red: {
    iconBg: "bg-red-50",
    iconColor: "text-red-700",
    iconSolid: "bg-red-600",
    valueColor: "text-slate-900",
  },
  slate: {
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
    iconSolid: "bg-slate-600",
    valueColor: "text-slate-900",
  },
};

const MiniStat = ({ label, value }) => (
  <div className="rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
      {label}
    </p>
    <p className="mt-1 text-2xl font-bold text-emerald-950">{value}</p>
  </div>
);

const StatCard = ({ label, value, icon: Icon, tone = "emerald" }) => {
  const styles = toneMap[tone] || toneMap.emerald;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${styles.valueColor}`}>
            {value}
          </p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.iconBg}`}>
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
      </div>
    </div>
  );
};

const ActivityRow = ({ activity, isLast }) => {
  const Icon = activity.icon;
  const styles = toneMap[activity.tone] || toneMap.emerald;

  return (
    <div
      className={`px-4 py-4 sm:px-5 ${
        !isLast ? "border-b border-slate-100" : ""
      }`}
    >
      <div className="flex items-start gap-4 rounded-2xl bg-white p-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.iconSolid}`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-900">
                {activity.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {activity.description}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {activity.details}
              </p>
            </div>

            <div className="shrink-0 text-xs font-medium text-slate-500">
              {formatActivityDate(activity.date)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingRow = () => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
    <div className="flex items-start gap-4">
      <div className="h-11 w-11 rounded-2xl bg-slate-200" />
      <div className="flex-1">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="mt-2 h-3 w-56 rounded bg-slate-200" />
        <div className="mt-3 h-3 w-28 rounded bg-slate-200" />
      </div>
      <div className="h-3 w-20 rounded bg-slate-200" />
    </div>
  </div>
);

const formatActivityDate = (dateValue) => {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default DashboardActivity;
