import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import {
  FaChartBar,
  FaChartLine,
  FaClipboardCheck,
  FaMapMarkerAlt,
  FaLayerGroup,
} from "react-icons/fa";
import { schoolConfig } from "../../config/schoolConfig";
import AdminContainer from "../../components/admin/AdminContainer";
import LoadingState from "../../components/admin/LoadingState";

const API_BASE = "http://localhost:3001/api";

const AdminReports = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/items`, {
        withCredentials: true,
      });

      const itemsArray = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setItems(itemsArray);
    } catch (error) {
      console.error("[AdminReports] Error fetching items:", error);
      toast.error("Failed to load report data");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalItems = items.length;
    const lostItems = items.filter((i) => i.itemType === "Lost").length;
    const foundItems = items.filter((i) => i.itemType === "Found").length;
    const recoveredItems = items.filter((i) => i.status === "recovered").length;
    const verifiedItems = items.filter(
      (i) => i.verificationStatus === "verified"
    ).length;
    const pendingItems = items.filter(
      (i) => !i.verificationStatus || i.verificationStatus === "pending"
    ).length;
    const rejectedItems = items.filter(
      (i) => i.verificationStatus === "rejected"
    ).length;

    const categoryCount = {};
    const locationCount = {};

    items.forEach((item) => {
      if (item.category) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      }

      if (item.location) {
        locationCount[item.location] = (locationCount[item.location] || 0) + 1;
      }
    });

    return {
      totalItems,
      lostItems,
      foundItems,
      recoveredItems,
      verifiedItems,
      pendingItems,
      rejectedItems,
      activeItems: totalItems - recoveredItems,
      recoveryRate:
        totalItems > 0 ? ((recoveredItems / totalItems) * 100).toFixed(1) : 0,
      verificationRate:
        totalItems > 0 ? ((verifiedItems / totalItems) * 100).toFixed(1) : 0,
      pendingRate:
        totalItems > 0 ? ((pendingItems / totalItems) * 100).toFixed(1) : 0,
      rejectedRate:
        totalItems > 0 ? ((rejectedItems / totalItems) * 100).toFixed(1) : 0,
      activeRate:
        totalItems > 0
          ? (((totalItems - recoveredItems) / totalItems) * 100).toFixed(1)
          : 0,
      categoryCount: Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      locationCount: Object.entries(locationCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
    };
  }, [items]);

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
        <title>{`Reports | ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <AdminContainer>
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[28px] border border-emerald-300 bg-gradient-to-br from-emerald-700 via-emerald-700 to-green-800">
            <div className="flex flex-col gap-6 px-6 py-7 text-white lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-8">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                  Reports Workspace
                </div>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Reports & Analytics
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/90 md:text-base">
                  View platform performance, recovery rates, verification progress,
                  and the most common categories and locations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <BannerMiniStat label="Total" value={stats.totalItems} />
                <BannerMiniStat label="Recovered" value={stats.recoveredItems} />
                <BannerMiniStat label="Verified" value={stats.verifiedItems} />
                <BannerMiniStat label="Active" value={stats.activeItems} />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<FaLayerGroup />}
              label="Total Items"
              value={stats.totalItems}
              tone="emerald"
            />
            <StatCard
              icon={<FaChartBar />}
              label="Lost Items"
              value={stats.lostItems}
              tone="red"
            />
            <StatCard
              icon={<FaChartBar />}
              label="Found Items"
              value={stats.foundItems}
              tone="green"
            />
            <StatCard
              icon={<FaChartLine />}
              label="Recovered"
              value={stats.recoveredItems}
              tone="blue"
            />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Verification Status
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Verified, pending, and rejected items
                </p>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <ProgressRow
                  label="Verified"
                  value={stats.verifiedItems}
                  percent={stats.verificationRate}
                  barClass="bg-emerald-500"
                  textClass="text-emerald-700"
                />
                <ProgressRow
                  label="Pending Review"
                  value={stats.pendingItems}
                  percent={stats.pendingRate}
                  barClass="bg-amber-500"
                  textClass="text-amber-700"
                />
                <ProgressRow
                  label="Rejected"
                  value={stats.rejectedItems}
                  percent={stats.rejectedRate}
                  barClass="bg-red-500"
                  textClass="text-red-700"
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Recovery Status
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Recovered and active item rates
                </p>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <ProgressRow
                  label="Recovered Items"
                  value={stats.recoveredItems}
                  percent={stats.recoveryRate}
                  barClass="bg-green-500"
                  textClass="text-green-700"
                />
                <ProgressRow
                  label="Active Items"
                  value={stats.activeItems}
                  percent={stats.activeRate}
                  barClass="bg-blue-500"
                  textClass="text-blue-700"
                />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                    <FaClipboardCheck />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Items by Category
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Most common item categories
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {stats.categoryCount?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.categoryCount.map(([category, count]) => (
                      <BarListRow
                        key={category}
                        label={category}
                        value={count}
                        percent={stats.totalItems ? (count / stats.totalItems) * 100 : 0}
                        barClass="bg-emerald-600"
                        valueClass="text-emerald-700"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No data available
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-green-100 bg-green-50 text-green-700">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Items by Location
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Most common reported locations
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {stats.locationCount?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.locationCount.map(([location, count]) => (
                      <BarListRow
                        key={location}
                        label={location}
                        value={count}
                        percent={stats.totalItems ? (count / stats.totalItems) * 100 : 0}
                        barClass="bg-green-600"
                        valueClass="text-green-700"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No data available
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </AdminContainer>
    </>
  );
};

function BannerMiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-50/85">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StatCard({ icon, label, value, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
    green: "bg-green-50 text-green-700 border-green-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-base ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  percent,
  barClass,
  textClass,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={`text-sm font-bold ${textClass}`}>{value}</span>
      </div>

      <div className="h-2 w-full rounded-full bg-slate-200">
        <div
          className={`h-2 rounded-full ${barClass}`}
          style={{ width: `${percent || 0}%` }}
        />
      </div>

      <p className="mt-1 text-xs text-slate-500">{percent || 0}%</p>
    </div>
  );
}

function BarListRow({
  label,
  value,
  percent,
  barClass,
  valueClass,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-slate-700">
          {label}
        </span>
        <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
      </div>

      <div className="h-2 w-full rounded-full bg-slate-200">
        <div
          className={`h-2 rounded-full ${barClass}`}
          style={{ width: `${percent || 0}%` }}
        />
      </div>
    </div>
  );
}

export default AdminReports;