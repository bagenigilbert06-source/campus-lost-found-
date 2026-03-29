import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaBox,
  FaCheckCircle,
  FaHourglass,
  FaSearch,
  FaPlus,
  FaEye,
  FaComments,
  FaHistory,
  FaArrowRight,
} from 'react-icons/fa';

import AuthContext from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';
import { notificationService, claimsService, itemsService } from '../../services/apiService';

const API_BASE = 'http://localhost:3001/api';

const QUICK_LINKS = [
  {
    title: 'Search for Items',
    description: 'Find lost or found items on campus quickly.',
    path: '/app/search',
    icon: FaSearch,
    iconWrap: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
  },
  {
    title: 'Post Item',
    description: 'Report a lost or found item in a few steps.',
    path: '/app/post-item',
    icon: FaPlus,
    iconWrap: 'bg-teal-50',
    iconColor: 'text-teal-700',
  },
  {
    title: 'My Items',
    description: 'Manage your posted items and track updates.',
    path: '/app/my-items',
    icon: FaBox,
    iconWrap: 'bg-amber-50',
    iconColor: 'text-amber-700',
  },
  {
    title: 'Recovered Items',
    description: 'Check items marked as recovered.',
    path: '/app/recovered',
    icon: FaEye,
    iconWrap: 'bg-sky-50',
    iconColor: 'text-sky-700',
  },
];

const defaultStats = {
  itemsPosted: 0,
  claimsSubmitted: 0,
  claimsApproved: 0,
  claimsPending: 0,
  itemsRecovered: 0,
  unreadMessages: 0,
};

function getFirstName(user) {
  if (!user) return 'Student';
  if (user.displayName && typeof user.displayName === 'string') {
    return user.displayName.trim().split(' ')[0] || 'Student';
  }
  if (user.name && typeof user.name === 'string') {
    return user.name.trim().split(' ')[0] || 'Student';
  }
  if (user.email && typeof user.email === 'string') {
    return user.email.split('@')[0];
  }
  return 'Student';
}

function formatActivityDate(dateValue) {
  if (!dateValue) return 'Recently';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DashboardShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {children}
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function MiniSummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-white/80 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-emerald-950">{value}</p>
    </div>
  );
}

function DashboardHero({ user, stats, loading }) {
  return (
    <section className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-5 shadow-sm sm:mb-8 sm:p-6 lg:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-700">
            Student Dashboard
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
            Welcome back, {getFirstName(user)}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-800/90 sm:text-base">
            Here is a clean view of your lost and found activity, claims, messages,
            and important actions in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[360px]">
          <MiniSummaryCard
            label="Items"
            value={loading ? '...' : stats.itemsPosted}
          />
          <MiniSummaryCard
            label="Claims"
            value={loading ? '...' : stats.claimsSubmitted}
          />
          <MiniSummaryCard
            label="Unread"
            value={loading ? '...' : stats.unreadMessages}
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, icon: Icon, valueClassName, link }) {
  return (
    <Link
      to={link}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className={`mt-3 text-3xl font-bold leading-none ${valueClassName}`}>
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon className={`text-lg ${valueClassName}`} />
        </div>
      </div>
    </Link>
  );
}

function QuickActionCard({ title, description, path, icon: Icon, iconWrap, iconColor }) {
  return (
    <Link
      to={path}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconWrap}`}>
        <Icon className={`text-lg ${iconColor}`} />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 sm:text-[15px]">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
        Open
        <FaArrowRight className="text-xs" />
      </div>
    </Link>
  );
}

function ActivityRow({ activity, isLast }) {
  const Icon = activity.icon || FaHistory;

  return (
    <div
      className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5 ${
        !isLast ? 'border-b border-slate-100' : ''
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
        <Icon className="text-sm text-emerald-700" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {activity.title || 'Activity update'}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {activity.description || 'Recent change on your account'}
        </p>
      </div>

      <div className="shrink-0 text-xs font-medium text-slate-500">
        {formatActivityDate(activity.date)}
      </div>
    </div>
  );
}

function EmptyActivityState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <FaHistory className="text-2xl text-slate-400" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        No recent activity yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Start by posting a lost or found item, browsing available items, or checking
        your claims and messages.
      </p>

      <div className="mt-5">
        <Link
          to="/app/search"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Browse Items
        </Link>
      </div>
    </div>
  );
}

function LoadingCard({ height = 'h-28' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${height}`}>
      <div className="flex h-full flex-col justify-between p-5">
        <div className="h-3 w-24 rounded bg-slate-100" />
        <div className="h-8 w-16 rounded bg-slate-100" />
      </div>
    </div>
  );
}

const DashboardHome = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(defaultStats);
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [claimsRes, itemsRes, messagesRes, notificationsRes] = await Promise.all([
        claimsService.getClaims(user.email),
        itemsService.getAllItems({ userEmail: user.email }),
        axios
          .get(`${API_BASE}/messages`, {
            params: { recipientEmail: user.email },
            withCredentials: true,
          })
          .catch(() => ({ data: [] })),
        notificationService.getNotifications(),
      ]);

      const claimsData = Array.isArray(claimsRes.data)
        ? claimsRes.data
        : claimsRes.data?.data || [];

      const itemsData = Array.isArray(itemsRes.data)
        ? itemsRes.data
        : itemsRes.data?.data || [];

      const messagesData = Array.isArray(messagesRes.data)
        ? messagesRes.data
        : messagesRes.data?.data || [];

      const notificationsData = notificationsRes.notifications || notificationsRes.data || [];

      const approved = claimsData.filter((claim) => claim.status === 'approved').length;
      const pending = claimsData.filter((claim) => claim.status === 'pending').length;
      const recovered = itemsData.filter((item) => item.status === 'recovered').length;
      const unread = messagesData.filter((message) => !message.isRead).length;

      setStats({
        itemsPosted: itemsData.length,
        claimsSubmitted: claimsData.length,
        claimsApproved: approved,
        claimsPending: pending,
        itemsRecovered: recovered,
        unreadMessages: unread,
      });

      // Build activity from multiple sources
      const allActivities = [
        ...itemsData.map((item) => ({
          type: 'item',
          title: item.title || 'Item posted',
          description: `Posted ${item.itemType || 'item'} ${item.subType ? `(${item.subType})` : ''} in ${item.category}`,
          date: item.createdAt,
          icon: FaBox,
        })),

        ...claimsData.map((claim) => ({
          type: 'claim',
          title: claim.itemTitle || 'Claim submitted',
          description: `Claim ${claim.status || 'pending'}`,
          date: claim.createdAt,
          icon: FaCheckCircle,
        })),
        ...notificationsData.slice(0, 3).map((notif) => ({
          type: 'notification',
          title: notif.title || 'New notification',
          description: notif.message,
          date: notif.createdAt,
          icon: FaComments,
        })),
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setRecentActivity(allActivities);
    } catch (error) {
      console.error('[DashboardHome] Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    fetchDashboardData();
  }, [user, navigate, fetchDashboardData]);

  const statCards = useMemo(
    () => [
      {
        label: 'Items Posted',
        value: stats.itemsPosted,
        icon: FaBox,
        valueClassName: 'text-emerald-700',
        link: '/app/my-items',
      },
      {
        label: 'Claims Submitted',
        value: stats.claimsSubmitted,
        icon: FaCheckCircle,
        valueClassName: 'text-slate-900',
        link: '/app/dashboard',
      },
      {
        label: 'Awaiting Review',
        value: stats.claimsPending,
        icon: FaHourglass,
        valueClassName: 'text-amber-600',
        link: '/app/dashboard',
      },
      {
        label: 'Approved Claims',
        value: stats.claimsApproved,
        icon: FaCheckCircle,
        valueClassName: 'text-green-700',
        link: '/app/dashboard',
      },
      {
        label: 'Items Recovered',
        value: stats.itemsRecovered,
        icon: FaEye,
        valueClassName: 'text-sky-700',
        link: '/app/recovered',
      },
      {
        label: 'New Messages',
        value: stats.unreadMessages,
        icon: FaComments,
        valueClassName: 'text-emerald-700',
        link: '/app/messages',
      },
    ],
    [stats]
  );

  return (
    <DashboardShell>
      <Helmet>
        <title>{`Dashboard - ${schoolConfig.name}`}</title>
      </Helmet>

      <DashboardHero user={user} stats={stats} loading={loading} />

      <section className="mb-6 sm:mb-8">
        <SectionTitle
          title="Overview"
          subtitle="Your main statistics in one clean view."
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                valueClassName={card.valueClassName}
                link={card.link}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-6 sm:mb-8">
        <SectionTitle
          title="Quick Actions"
          subtitle="Open the most important student actions faster."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <QuickActionCard key={link.path} {...link} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          title="Recent Activity"
          subtitle="Latest updates from your posts and claims."
          action={
            <Link
              to="/app/my-items"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              View My Items
            </Link>
          }
        />

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 p-4"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-100" />
                  <div className="flex-1">
                    <div className="h-3 w-40 rounded bg-slate-100" />
                    <div className="mt-2 h-3 w-28 rounded bg-slate-100" />
                  </div>
                  <div className="h-3 w-20 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {recentActivity.map((activity, index) => (
              <ActivityRow
                key={`${activity.type || 'activity'}-${index}`}
                activity={activity}
                isLast={index === recentActivity.length - 1}
              />
            ))}
          </div>
        ) : (
          <EmptyActivityState />
        )}
      </section>
    </DashboardShell>
  );
};

export default DashboardHome;
