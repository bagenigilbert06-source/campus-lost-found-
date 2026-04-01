import React, { useState, useEffect, useContext, useMemo } from "react";
import { API_BASE } from '../../utils/apiConfig.js';
import { Link } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import AuthContext from "../../context/Authcontext/AuthContext";
import { schoolConfig } from "../../config/schoolConfig";
import {
  FaSearch,
  FaFilter,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxes,
  FaDownload,
  FaCalendarAlt,
  FaComment,
  FaHistory,
  FaArchive,
  FaBars,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import AdminContainer from "../../components/admin/AdminContainer";
import EmptyState from "../../components/admin/EmptyState";
import LoadingState from "../../components/admin/LoadingState";
import ConfirmationDialog from "../../components/ConfirmationDialog";


const AdminInventory = () => {
  const { user } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVerification, setFilterVerification] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [sortBy, setSortBy] = useState("-createdAt");

  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    itemId: null,
    itemTitle: "",
  });
  const [deleting, setDeleting] = useState(false);

  const [noteEdit, setNoteEdit] = useState({
    isOpen: false,
    itemId: null,
    currentNote: "",
    newNote: "",
  });

  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionReasonModal, setShowRejectionReasonModal] = useState({
    isOpen: false,
    itemId: null,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchQuery, filterType, filterStatus, filterVerification, filterCondition, filterStartDate, filterEndDate, sortBy]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      filtered: filteredItems.length,
      pending: items.filter(
        (item) => (item.verificationStatus || "pending") === "pending"
      ).length,
      verified: items.filter(
        (item) => item.verificationStatus === "verified"
      ).length,
      rejected: items.filter(
        (item) => item.verificationStatus === "rejected"
      ).length,
      lost: items.filter((item) => item.itemType === "Lost").length,
      found: items.filter((item) => item.itemType === "Found").length,
      recovered: items.filter((item) => item.status === "recovered").length,
      claimed: items.filter((item) => item.status === "claimed" || item.status === "claim_in_progress").length,
    };
  }, [items, filteredItems]);

  const fetchItems = async () => {
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
      console.error("[AdminInventory] Error fetching items:", error);
      toast.error("Failed to load items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.adminNotes?.toLowerCase().includes(query)
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((item) => item.itemType === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (item) => (item.status || "active") === filterStatus
      );
    }

    if (filterVerification !== "all") {
      filtered = filtered.filter(
        (item) =>
          (item.verificationStatus || "pending") === filterVerification
      );
    }

    if (filterCondition !== "all") {
      filtered = filtered.filter(
        (item) => (item.condition || "unknown") === filterCondition
      );
    }

    if (filterStartDate) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.createdAt) >= new Date(filterStartDate)
      );
    }

    if (filterEndDate) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.createdAt) <= new Date(filterEndDate)
      );
    }

    // Sorting
    if (sortBy === "-createdAt") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "createdAt") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "title") {
      filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "status") {
      filtered.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    }

    setCurrentPage(1);
    setFilteredItems(filtered);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterStatus("all");
    setFilterVerification("all");
    setFilterCondition("all");
    setFilterStartDate("");
    setFilterEndDate("");
    setSortBy("-createdAt");
    setSelectedItems(new Set());
    setCurrentPage(1);
  };

  const handleDeleteItem = (itemId, itemTitle) => {
    setDeleteConfirm({
      isOpen: true,
      itemId,
      itemTitle,
    });
  };

  const confirmDelete = async () => {
    const itemIdToDelete = deleteConfirm.itemId;
    setDeleting(true);

    try {
      setItems((prev) => prev.filter((item) => item._id !== itemIdToDelete));
      setFilteredItems((prev) =>
        prev.filter((item) => item._id !== itemIdToDelete)
      );

      await axios.delete(`${API_BASE}/items/${itemIdToDelete}`, {
        withCredentials: true,
      });

      toast.success("Item deleted successfully");
      setDeleteConfirm({
        isOpen: false,
        itemId: null,
        itemTitle: "",
      });
    } catch (error) {
      console.error("[AdminInventory] Error deleting item:", error);
      toast.error("Failed to delete item");
      fetchItems();
    } finally {
      setDeleting(false);
    }
  };

  const handleVerifyItem = async (itemId) => {
    try {
      await axios.patch(
        `${API_BASE}/items/${itemId}`,
        {
          verificationStatus: "verified",
          verifiedBy: user?.email,
          verifiedAt: new Date().toISOString(),
        },
        { withCredentials: true }
      );

      toast.success("Item verified");
      fetchItems();
    } catch (error) {
      console.error("[AdminInventory] Error verifying item:", error);
      toast.error("Failed to verify item");
    }
  };

  const handleRejectItem = async (itemId) => {
    try {
      await axios.patch(
        `${API_BASE}/items/${itemId}`,
        {
          verificationStatus: "rejected",
          rejectionReason: rejectionReason,
          verifiedBy: user?.email,
          verifiedAt: new Date().toISOString(),
        },
        { withCredentials: true }
      );

      toast.success("Item rejected");
      setShowRejectionReasonModal({ isOpen: false, itemId: null });
      setRejectionReason("");
      fetchItems();
    } catch (error) {
      console.error("[AdminInventory] Error rejecting item:", error);
      toast.error("Failed to reject item");
    }
  };

  // Toggle item selection for bulk actions
  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Select all items on current page
  const toggleSelectAllOnPage = () => {
    const newSelected = new Set(selectedItems);
    const pageItems = paginatedItems;
    
    if (selectedItems.size === pageItems.length && pageItems.length > 0) {
      pageItems.forEach(item => newSelected.delete(item._id));
    } else {
      pageItems.forEach(item => newSelected.add(item._id));
    }
    setSelectedItems(newSelected);
  };

  // Bulk verify
  const bulkVerify = async () => {
    if (selectedItems.size === 0) {
      toast.error("No items selected");
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedItems).map(itemId =>
          axios.patch(
            `${API_BASE}/items/${itemId}`,
            {
              verificationStatus: "verified",
              verifiedBy: user?.email,
              verifiedAt: new Date().toISOString(),
            },
            { withCredentials: true }
          )
        )
      );

      toast.success(`${selectedItems.size} item(s) verified`);
      setSelectedItems(new Set());
      fetchItems();
    } catch (error) {
      console.error("Error bulk verifying:", error);
      toast.error("Failed to verify some items");
    }
  };

  // Bulk reject
  const bulkReject = async () => {
    if (selectedItems.size === 0) {
      toast.error("No items selected");
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedItems).map(itemId =>
          axios.patch(
            `${API_BASE}/items/${itemId}`,
            {
              verificationStatus: "rejected",
              rejectionReason: "Bulk rejected by admin",
              verifiedBy: user?.email,
              verifiedAt: new Date().toISOString(),
            },
            { withCredentials: true }
          )
        )
      );

      toast.success(`${selectedItems.size} item(s) rejected`);
      setSelectedItems(new Set());
      fetchItems();
    } catch (error) {
      console.error("Error bulk rejecting:", error);
      toast.error("Failed to reject some items");
    }
  };

  // Bulk delete
  const bulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.error("No items selected");
      return;
    }

    if (!window.confirm(`Delete ${selectedItems.size} item(s)? This cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      await Promise.all(
        Array.from(selectedItems).map(itemId =>
          axios.delete(`${API_BASE}/items/${itemId}`, { withCredentials: true })
        )
      );

      toast.success(`${selectedItems.size} item(s) deleted`);
      setSelectedItems(new Set());
      fetchItems();
    } catch (error) {
      console.error("Error bulk deleting:", error);
      toast.error("Failed to delete some items");
    } finally {
      setDeleting(false);
    }
  };

  // Add/Update item notes
  const handleSaveNote = async (itemId) => {
    try {
      await axios.patch(
        `${API_BASE}/items/${itemId}`,
        {
          adminNotes: noteEdit.newNote,
          lastUpdatedBy: user?.email,
          lastUpdatedAt: new Date().toISOString(),
        },
        { withCredentials: true }
      );

      toast.success("Note saved");
      setNoteEdit({ isOpen: false, itemId: null, currentNote: "", newNote: "" });
      fetchItems();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredItems.length === 0) {
      toast.error("No items to export");
      return;
    }

    const headers = [
      "Title",
      "Type",
      "Category",
      "Location",
      "Status",
      "Verification",
      "Condition",
      "Date Posted",
      "Admin Notes",
    ];

    const rows = filteredItems.map(item => [
      item.title || "",
      item.itemType || "",
      item.category || "",
      item.location || "",
      item.status || "active",
      item.verificationStatus || "pending",
      item.condition || "unknown",
      new Date(item.createdAt).toLocaleDateString(),
      (item.adminNotes || "").replace(/"/g, '""'),
    ]);

    const csv = [
      headers.map(h => `"${h}"`).join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success("Exported successfully");
  };

  // Pagination
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  if (loading) {
    return (
      <AdminContainer>
        <LoadingState type="table" count={5} />
      </AdminContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Inventory | ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteConfirm.itemTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={deleting}
        onConfirm={confirmDelete}
        onCancel={() =>
          setDeleteConfirm({ isOpen: false, itemId: null, itemTitle: "" })
        }
      />

      <AdminContainer>
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[28px] border border-emerald-300 bg-gradient-to-br from-emerald-700 via-emerald-700 to-green-800">
            <div className="flex flex-col gap-6 px-6 py-7 text-white lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-8">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                  Inventory Workspace
                </div>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Inventory Management
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/90 md:text-base">
                  Review, filter, verify, reject, and remove lost and found items
                  from one clean admin workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <BannerMiniStat label="All Items" value={stats.total} />
                <BannerMiniStat label="Showing" value={stats.filtered} />
                <BannerMiniStat label="Pending" value={stats.pending} />
                <BannerMiniStat label="Verified" value={stats.verified} />
                <BannerMiniStat label="Lost" value={stats.lost} color="red" />
                <BannerMiniStat label="Found" value={stats.found} color="green" />
                <BannerMiniStat label="Recovered" value={stats.recovered} color="blue" />
                <BannerMiniStat label="Claimed" value={stats.claimed} color="purple" />
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-bold text-slate-900">Filters</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and narrow down inventory items
              </p>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search by title, location, category, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <FilterSelect
                  label="Item Type"
                  value={filterType}
                  onChange={setFilterType}
                  options={[
                    { value: "all", label: "All Types" },
                    { value: "Lost", label: "Lost Items" },
                    { value: "Found", label: "Found Items" },
                  ]}
                />

                <FilterSelect
                  label="Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "active", label: "Active" },
                    { value: "recovered", label: "Recovered" },
                    { value: "claimed", label: "Claimed" },
                  ]}
                />

                <FilterSelect
                  label="Verification"
                  value={filterVerification}
                  onChange={setFilterVerification}
                  options={[
                    { value: "all", label: "All" },
                    { value: "pending", label: "Pending" },
                    { value: "verified", label: "Verified" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                />

                <FilterSelect
                  label="Condition"
                  value={filterCondition}
                  onChange={setFilterCondition}
                  options={[
                    { value: "all", label: "All Conditions" },
                    { value: "excellent", label: "Excellent" },
                    { value: "good", label: "Good" },
                    { value: "fair", label: "Fair" },
                    { value: "poor", label: "Poor" },
                    { value: "unknown", label: "Unknown" },
                  ]}
                />

                <FilterSelect
                  label="Sort By"
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: "-createdAt", label: "Newest First" },
                    { value: "createdAt", label: "Oldest First" },
                    { value: "title", label: "Title (A-Z)" },
                    { value: "status", label: "Status" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700"
                    type="button"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Items</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Showing {paginatedItems.length} of {filteredItems.length} items {filteredItems.length !== items.length && `(filtered from ${items.length})`}
                </p>
              </div>

              <div className="flex gap-2">
                {selectedItems.size > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={bulkVerify}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      type="button"
                      title="Verify selected items"
                    >
                      <FaCheckCircle size={14} />
                      Verify ({selectedItems.size})
                    </button>

                    <button
                      onClick={bulkReject}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                      type="button"
                      title="Reject selected items"
                    >
                      <FaTimesCircle size={14} />
                      Reject ({selectedItems.size})
                    </button>

                    <button
                      onClick={bulkDelete}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-300 bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 disabled:opacity-50"
                      type="button"
                      title="Delete selected items"
                    >
                      <FaTrash size={14} />
                      Delete ({selectedItems.size})
                    </button>
                  </div>
                )}

                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
                  type="button"
                  title="Export to CSV"
                >
                  <FaDownload size={14} />
                  Export
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {filteredItems.length === 0 ? (
                <EmptyState
                  icon={FaFilter}
                  title="No items found"
                  description="Try adjusting your filters or search terms."
                />
              ) : (
                <>
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-4 text-left">
                            <input
                              type="checkbox"
                              checked={paginatedItems.length > 0 && selectedItems.size === paginatedItems.length}
                              onChange={toggleSelectAllOnPage}
                              className="rounded border-slate-300 cursor-pointer"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                            Item
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                            Type
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                            Location
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                            Verification
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                            Condition
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedItems.map((item) => (
                          <tr key={item._id} className="border-b border-slate-200 last:border-b-0">
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedItems.has(item._id)}
                                onChange={() => toggleItemSelection(item._id)}
                                className="rounded border-slate-300 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {item.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {item.category || "Uncategorized"}
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <TypeBadge type={item.itemType} />
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-600">
                              {item.location || "Unknown location"}
                            </td>

                            <td className="px-6 py-4">
                              <StatusBadge status={item.status || "active"} />
                            </td>

                            <td className="px-6 py-4">
                              <VerificationBadge
                                status={item.verificationStatus || "pending"}
                              />
                            </td>

                            <td className="px-6 py-4">
                              <ConditionBadge condition={item.condition || "unknown"} />
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Link
                                  to={`/items/${item._id}`}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
                                  title="View"
                                >
                                  <FaEye size={12} />
                                </Link>

                                <button
                                  onClick={() =>
                                    setNoteEdit({
                                      isOpen: true,
                                      itemId: item._id,
                                      currentNote: item.adminNotes || "",
                                      newNote: item.adminNotes || "",
                                    })
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
                                  title="Add/Edit notes"
                                  type="button"
                                >
                                  <FaComment size={12} />
                                </button>

                                {item.verificationStatus !== "verified" && (
                                  <>
                                    <button
                                      onClick={() => handleVerifyItem(item._id)}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white"
                                      title="Verify"
                                      type="button"
                                    >
                                      <FaCheckCircle size={12} />
                                    </button>

                                    <button
                                      onClick={() =>
                                        setShowRejectionReasonModal({
                                          isOpen: true,
                                          itemId: item._id,
                                        })
                                      }
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700"
                                      title="Reject"
                                      type="button"
                                    >
                                      <FaTimesCircle size={12} />
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() =>
                                    handleDeleteItem(item._id, item.title)
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600"
                                  title="Delete"
                                  type="button"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="divide-y divide-slate-200 md:hidden">
                    {paginatedItems.map((item) => (
                      <div key={item._id} className="space-y-4 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-semibold text-slate-900">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              {item.category || "Uncategorized"}
                            </p>
                          </div>

                          <TypeBadge type={item.itemType} />
                        </div>

                        <div className="space-y-2 text-sm text-slate-600">
                          <p>
                            <span className="font-medium text-slate-700">Location:</span>{" "}
                            {item.location || "Unknown location"}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <StatusBadge status={item.status || "active"} />
                            <VerificationBadge
                              status={item.verificationStatus || "pending"}
                            />
                            <ConditionBadge condition={item.condition || "unknown"} />
                          </div>
                        </div>

                        {item.adminNotes && (
                          <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                            <span className="font-semibold">Notes:</span> {item.adminNotes}
                          </p>
                        )}

                        <div className="flex gap-2 border-t border-slate-200 pt-3">
                          <Link
                            to={`/items/${item._id}`}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
                          >
                            <FaEye size={12} />
                            View
                          </Link>

                          <button
                            onClick={() =>
                              setNoteEdit({
                                isOpen: true,
                                itemId: item._id,
                                currentNote: item.adminNotes || "",
                                newNote: item.adminNotes || "",
                              })
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
                            type="button"
                          >
                            <FaComment size={12} />
                            Notes
                          </button>

                          {item.verificationStatus !== "verified" && (
                            <button
                              onClick={() => handleVerifyItem(item._id)}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                              type="button"
                            >
                              <FaCheckCircle size={12} />
                              Verify
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteItem(item._id, item.title)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                            type="button"
                          >
                            <FaTrash size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {filteredItems.length > itemsPerPage && (
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                    <div className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                        type="button"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                        type="button"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                </>
              )}
            </div>
          </section>
          {showRejectionReasonModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900">Reject Item</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Provide a reason for rejecting this item (optional).
                </p>

                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="mt-4 h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowRejectionReasonModal({ isOpen: false, itemId: null });
                      setRejectionReason("");
                    }}
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                    type="button"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() =>
                      handleRejectItem(showRejectionReasonModal.itemId)
                    }
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes Modal */}
          {noteEdit.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900">Admin Notes</h3>

                <textarea
                  value={noteEdit.newNote}
                  onChange={(e) =>
                    setNoteEdit({ ...noteEdit, newNote: e.target.value })
                  }
                  placeholder="Add your notes here..."
                  className="mt-4 h-32 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() =>
                      setNoteEdit({
                        isOpen: false,
                        itemId: null,
                        currentNote: "",
                        newNote: "",
                      })
                    }
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                    type="button"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => handleSaveNote(noteEdit.itemId)}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    type="button"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminContainer>
    </>
  );
};

function BannerMiniStat({ label, value, color = "emerald" }) {
  const colorClasses = {
    emerald: "border-emerald-300 bg-emerald-500/20",
    red: "border-red-300 bg-red-500/20",
    green: "border-green-300 bg-green-500/20",
    blue: "border-blue-300 bg-blue-500/20",
    purple: "border-purple-300 bg-purple-500/20",
  };

  return (
    <div className={`rounded-2xl border ${colorClasses[color]} px-4 py-3`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/85">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TypeBadge({ type }) {
  const isLost = type === "Lost";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        isLost ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {type || "Item"}
    </span>
  );
}

function StatusBadge({ status }) {
  const normalized = status || "active";

  const classes =
    normalized === "recovered"
      ? "bg-emerald-100 text-emerald-700"
      : normalized === "claimed"
      ? "bg-blue-100 text-blue-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes}`}>
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
}

function VerificationBadge({ status }) {
  const normalized = status || "pending";

  const classes =
    normalized === "verified"
      ? "bg-emerald-100 text-emerald-700"
      : normalized === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-amber-100 text-amber-700";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes}`}>
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
}

function ConditionBadge({ condition }) {
  const normalized = condition || "unknown";

  const classes =
    normalized === "excellent"
      ? "bg-green-100 text-green-700"
      : normalized === "good"
      ? "bg-blue-100 text-blue-700"
      : normalized === "fair"
      ? "bg-yellow-100 text-yellow-700"
      : normalized === "poor"
      ? "bg-red-100 text-red-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes}`}>
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
}

export default AdminInventory;