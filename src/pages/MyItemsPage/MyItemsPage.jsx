import React, { useContext, useEffect, useMemo, useState } from "react";
import AuthContext from "../../context/Authcontext/AuthContext";
import { Link } from "react-router-dom";
import { itemsService, claimsService } from "../../services/apiService";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import { schoolConfig } from "../../config/schoolConfig";
import {
  FaBox,
  FaCheckCircle,
  FaEye,
  FaPlus,
  FaEdit,
  FaTrash,
  FaInbox,
} from "react-icons/fa";
import PaginationComponent from "../../components/PaginationComponent";

const ITEMS_PER_PAGE = 8;

const MyItemsPage = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [claims, setClaims] = useState([]);
  const [recovered, setRecovered] = useState([]);
  const [activeTab, setActiveTab] = useState("items");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const API_BASE = "http://localhost:3001/api";

  useEffect(() => {
    if (!user?.email) return;
    fetchAllData();
  }, [user?.email]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [itemsRes, claimsRes] = await Promise.all([
        itemsService
          .getUserItems(user.uid)
          .catch(() => ({ data: [] })),
        claimsService
          .getClaims(user.email)
          .catch(() => ({ data: [] })),
      ]);

      console.log('[MyItemsPage] Items response:', itemsRes);
      console.log('[MyItemsPage] User email:', user.email);

      const items = Array.isArray(itemsRes)
        ? itemsRes
        : Array.isArray(itemsRes.data)
        ? itemsRes.data
        : itemsRes.data?.data || [];

      console.log('[MyItemsPage] Extracted items:', items);

      console.log('[MyItemsPage] Extracted items:', items);

      const claimsData = Array.isArray(claimsRes.data)
        ? claimsRes.data
        : claimsRes.data?.data || [];

      // Fetch recovered items from dedicated endpoint so approved claims from other people are included
      const recoveredItemsApi = await itemsService.getRecoveredItems(user.email).catch(() => []);
      const recoveredItems = Array.isArray(recoveredItemsApi) ? recoveredItemsApi : [];

      setPosts(items.filter((item) => item.status !== "recovered"));
      setClaims(claimsData);
      setRecovered(recoveredItems);
    } catch (error) {
      console.error("[MyItemsPage] Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (_id) => {
    Swal.fire({
      title: "Delete item?",
      text: "You won't be able to revert this.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await itemsService.deleteItem(_id);
          Swal.fire("Deleted!", "Your item has been deleted.", "success");
          setPosts((prev) => prev.filter((post) => post._id !== _id));
        } catch (error) {
          console.error("[MyItemsPage] Error deleting item:", error);
          Swal.fire("Error!", "Item could not be deleted.", "error");
        }
      }
    });
  };

  const stats = useMemo(
    () => ({
      items: posts.length,
      claims: claims.length,
      recovered: recovered.length,
      total: posts.length + claims.length + recovered.length,
    }),
    [posts.length, claims.length, recovered.length]
  );

  const tabs = [
    {
      id: "items",
      label: "My Posted Items",
      count: posts.length,
      icon: FaBox,
    },
    {
      id: "claims",
      label: "My Claims",
      count: claims.length,
      icon: FaCheckCircle,
    },
    {
      id: "recovered",
      label: "Recovered Items",
      count: recovered.length,
      icon: FaEye,
    },
  ];

  const paginatedItems = posts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const paginatedClaims = claims.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const paginatedRecovered = recovered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const activeData = activeTab === "items" ? posts : activeTab === "claims" ? claims : recovered;
  const totalPages = Math.max(1, Math.ceil(activeData.length / ITEMS_PER_PAGE));

  return (
    <div className="min-h-screen bg-[#f7f8fa] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <Helmet>
        <title>{`Manage My Items - ${schoolConfig.name}`}</title>
      </Helmet>

      <div className="mx-auto max-w-7xl">
        {/* Hero */}
        <section className="mb-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-5 shadow-sm sm:mb-8 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                Item Management
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                My Items &amp; Claims
              </h1>

              <p className="mt-2 text-sm leading-6 text-emerald-900/80 sm:text-base">
                Manage your posted items, track your claims, and view recovered items
                in one clean workspace.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Items" value={stats.items} />
              <MiniStat label="Claims" value={stats.claims} />
              <MiniStat label="Recovered" value={stats.recovered} />
              <MiniStat label="Total" value={stats.total} />
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-8 sm:p-5">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold ${
                    active
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingRow key={index} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* My Posted Items */}
            {activeTab === "items" &&
              (posts.length === 0 ? (
                <EmptyState
                  icon={FaBox}
                  title="You have no items posted yet"
                  description="Add your first lost or found item to get started."
                  actionLabel="Report an Item"
                  actionTo="/app/post-item"
                />
              ) : (
                <>
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-slate-50">
                          <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                            <th className="px-4 py-4 font-semibold sm:px-5">Item</th>
                            <th className="px-4 py-4 font-semibold sm:px-5">Category</th>
                            <th className="px-4 py-4 font-semibold sm:px-5">Status</th>
                            <th className="px-4 py-4 font-semibold sm:px-5">Location</th>
                            <th className="px-4 py-4 font-semibold sm:px-5">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedItems.map((post) => (
                            <tr key={post._id} className="border-b border-slate-100 last:border-0">
                              <td className="px-4 py-4 sm:px-5">
                                <div className="flex min-w-[220px] items-center gap-3">
                                  <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-100">
                                    <img
                                      src={post.images?.[0] || post.image}
                                      alt={post.title}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                      {post.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                      {post.itemType || "Item"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4 sm:px-5">
                                <StatusPill tone="slate">{post.category}</StatusPill>
                              </td>

                              <td className="px-4 py-4 sm:px-5">
                                <StatusPill tone={post.status === "active" ? "green" : "amber"}>
                                  {post.status || "active"}
                                </StatusPill>
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-600 sm:px-5">
                                {post.location || "N/A"}
                              </td>

                              <td className="px-4 py-4 sm:px-5">
                                <div className="flex flex-wrap gap-2">
                                  <Link
                                    to={`/app/update/${post._id}`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white"
                                  >
                                    <FaEdit className="h-3 w-3" />
                                    Edit
                                  </Link>

                                  <button
                                    onClick={() => handleDelete(post._id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                                    type="button"
                                  >
                                    <FaTrash className="h-3 w-3" />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {totalPages > 1 && activeTab === "items" && (
                    <PaginationComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={posts.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              ))}

            {/* Claims */}
            {activeTab === "claims" &&
              (claims.length === 0 ? (
                <EmptyState
                  icon={FaCheckCircle}
                  title="You haven't claimed any items yet"
                  description="Search for items and submit a claim when you find your lost property."
                  actionLabel="Search Items"
                  actionTo="/app/search"
                />
              ) : (
                <>
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-slate-50">
                          <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                            <th className="px-4 py-4 font-semibold sm:px-5">Item Title</th>
                            <th className="px-4 py-4 font-semibold sm:px-5">Status</th>
                            <th className="px-4 py-4 font-semibold sm:px-5">Claimed On</th>
                            <th className="px-4 py-4 font-semibold sm:px-5">Category</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedClaims.map((claim) => (
                            <tr key={claim._id} className="border-b border-slate-100 last:border-0">
                              <td className="px-4 py-4 sm:px-5">
                                <p className="min-w-[200px] text-sm font-semibold text-slate-900">
                                  {claim.itemTitle}
                                </p>
                              </td>

                              <td className="px-4 py-4 sm:px-5">
                                <StatusPill
                                  tone={
                                    claim.status === "approved"
                                      ? "green"
                                      : claim.status === "rejected"
                                      ? "red"
                                      : "amber"
                                  }
                                >
                                  {claim.status || "pending"}
                                </StatusPill>
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-600 sm:px-5">
                                {new Date(claim.createdAt).toLocaleDateString()}
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-600 sm:px-5">
                                {claim.category || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {totalPages > 1 && activeTab === "claims" && (
                    <PaginationComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={claims.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              ))}

            {/* Recovered */}
            {activeTab === "recovered" &&
              (recovered.length === 0 ? (
                <EmptyState
                  icon={FaEye}
                  title="No recovered items yet"
                  description="Your approved and recovered items will appear here."
                />
              ) : (
                <>
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-green-50">
                          <tr className="border-b border-green-100 text-left text-sm text-green-700">
                            <th className="px-4 py-4 font-semibold sm:px-5">Item</th>
                            <th className="px-4 py-4 font-semibold sm:px-5">Category</th>
                            <th className="px-4 py-4 font-semibold sm:px-5">Recovered On</th>
                            <th className="px-4 py-4 font-semibold sm:px-5">Location Found</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRecovered.map((item) => (
                            <tr key={item._id} className="border-b border-slate-100 last:border-0">
                              <td className="px-4 py-4 sm:px-5">
                                <div className="flex min-w-[220px] items-center gap-3">
                                  <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-100">
                                    <img
                                      src={item.images?.[0] || item.image}
                                      alt={item.title}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                      {item.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                      Recovered item
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4 sm:px-5">
                                <StatusPill tone="green">{item.category}</StatusPill>
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-600 sm:px-5">
                                {item.updatedAt
                                  ? new Date(item.updatedAt).toLocaleDateString()
                                  : "N/A"}
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-600 sm:px-5">
                                {item.location || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {totalPages > 1 && activeTab === "recovered" && (
                    <PaginationComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={recovered.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
      {label}
    </p>
    <p className="mt-1 text-2xl font-bold text-emerald-950">{value}</p>
  </div>
);

const StatusPill = ({ children, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo }) => (
  <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
      <Icon className="text-2xl text-slate-400" />
    </div>

    <h2 className="mt-5 text-xl font-semibold text-slate-900">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      {description}
    </p>

    {actionLabel && actionTo ? (
      <div className="mt-5">
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
        >
          <FaPlus className="h-3.5 w-3.5" />
          {actionLabel}
        </Link>
      </div>
    ) : null}
  </div>
);

const LoadingRow = () => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-2xl bg-slate-200" />
      <div className="flex-1">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="mt-2 h-3 w-28 rounded bg-slate-200" />
      </div>
      <div className="h-8 w-20 rounded-xl bg-slate-200" />
    </div>
  </div>
);

export default MyItemsPage;