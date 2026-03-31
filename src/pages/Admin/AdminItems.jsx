import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { FiSearch } from "react-icons/fi";
import { FaBoxes, FaClipboardCheck, FaLayerGroup, FaArrowClockwise } from "react-icons/fa6";

import { schoolConfig } from "../../config/schoolConfig";
import useAdminItems from "../../hooks/useAdminItems";
import adminService from "../../services/adminService";
import AdminTable from "../../components/admin/AdminTable";
import StatusBadge from "../../components/admin/shared/StatusBadge";

const AdminItems = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { items, total, loading, error, refetch, categories } = useAdminItems(
    currentPage,
    filterStatus,
    filterCategory
  );

  const filteredItems = items.filter((item) => {
    const query = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  const handleVerify = async (itemId) => {
    try {
      await adminService.verifyItem(itemId);
      toast.success("Item verified successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to verify item");
      console.error(err);
    }
  };

  const handleReject = async (itemId) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
      await adminService.rejectItem(itemId, reason);
      toast.success("Item rejected");
      refetch();
    } catch (err) {
      toast.error("Failed to reject item");
      console.error(err);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await adminService.deleteItem(itemId);
      toast.success("Item deleted successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to delete item");
      console.error(err);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterCategory("all");
    setCurrentPage(1);
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (title) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{title}</span>
        </div>
      ),
    },
    { key: "itemType", label: "Type" },
    { key: "category", label: "Category" },
    {
      key: "verificationStatus",
      label: "Verification",
      render: (status) => <StatusBadge status={status || "pending"} />,
    },
    {
      key: "status",
      label: "Status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: "createdAt",
      label: "Posted",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: "Verify",
      variant: "success",
      onClick: (item) => handleVerify(item._id || item.id),
    },
    {
      label: "Reject",
      variant: "warning",
      onClick: (item) => handleReject(item._id || item.id),
    },
    {
      label: "Delete",
      variant: "danger",
      onClick: (item) => handleDelete(item._id || item.id),
    },
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`Items Management | ${schoolConfig.name} Admin`}</title>
      </Helmet>

      <section className="overflow-hidden rounded-[28px] border border-emerald-300 bg-gradient-to-br from-emerald-700 via-emerald-700 to-green-800">
        <div className="flex flex-col gap-6 px-6 py-7 text-white lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-8">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
              Items Workspace
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Items Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/90 md:text-base">
              Manage, review, verify, reject, and clean up all posted items from one
              smooth admin workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <BannerMiniStat label="Total" value={total} icon={<FaBoxes />} />
            <BannerMiniStat
              label="Showing"
              value={filteredItems.length}
              icon={<FaLayerGroup />}
            />
            <BannerMiniStat
              label="Status Filter"
              value={filterStatus === "all" ? "All" : filterStatus}
              icon={<FaClipboardCheck />}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          <p className="mt-1 text-sm text-slate-500">
            Search and narrow down the items list
          </p>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="relative lg:col-span-1">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="claimed">Claimed</option>
              <option value="recovered">Recovered</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="all">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700"
              type="button"
            >
              <FaArrowClockwise className="text-xs" />
              Reset Filters
            </button>
          </div>
        </div>
      </section>

      {error && (
        <section className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 sm:px-6">
          <p className="font-semibold text-red-700">Error loading items</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700"
            type="button"
          >
            Try Again
          </button>
        </section>
      )}

      <section className="rounded-[24px] border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-slate-900">Items Table</h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing {filteredItems.length} of {total} items
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <AdminTable
            columns={columns}
            data={filteredItems}
            loading={loading}
            error={error}
            actions={actions}
          />
        </div>
      </section>
    </div>
  );
};

function BannerMiniStat({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-50/85">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default AdminItems;