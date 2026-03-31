import React, { useContext, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { schoolConfig } from "../../config/schoolConfig";
import SmartSearchHelper from "../../components/SmartSearchHelper";
import PaginationComponent from "../../components/PaginationComponent";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaLink,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSlidersH,
  FaBoxOpen,
  FaChevronRight,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AuthContext from "../../context/Authcontext/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3001/api";

const SearchItems = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const categories = useMemo(
    () => [
      "Electronics",
      "IDs",
      "Keys",
      "Wallets",
      "Phones",
      "Laptops",
      "Bags",
      "Clothing",
      "Books",
      "Other",
    ],
    []
  );

  const locations = useMemo(
    () => [
      "Gate 1",
      "Gate 2",
      "Main Building",
      "Library",
      "Cafeteria",
      "Sports Complex",
      "Hostel",
      "Parking",
      "Security Office",
      "Other",
    ],
    []
  );

  const conditions = useMemo(() => ["Good", "Fair", "Damaged", "Unknown"], []);
  const statuses = useMemo(() => ["Active", "Claimed", "Recovered"], []);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    searchQuery,
    selectedCategory,
    selectedLocation,
    selectedStatus,
    selectedCondition,
    dateFrom,
    dateTo,
    sortBy,
    items,
  ]);

  const fetchItems = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/items?status=active&verificationStatus=verified`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }

      const data = await response.json();
      setItems(data.data || data || []);
    } catch (error) {
      console.error("[SearchItems] Error fetching items:", error);
      toast.error("Failed to load items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory || item.category === selectedCategory;

      const matchesLocation =
        !selectedLocation || item.location === selectedLocation;

      const matchesStatus =
        !selectedStatus ||
        (item.status &&
          item.status.toLowerCase() === selectedStatus.toLowerCase());

      const matchesCondition =
        !selectedCondition ||
        (item.condition &&
          item.condition.toLowerCase() === selectedCondition.toLowerCase());

      let matchesDateRange = true;

      if (dateFrom || dateTo) {
        const itemDate = new Date(item.dateLost || item.createdAt);

        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          matchesDateRange = matchesDateRange && itemDate >= fromDate;
        }

        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && itemDate <= toDate;
        }
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesStatus &&
        matchesCondition &&
        matchesDateRange
      );
    });

    if (sortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt || b.dateLost) -
          new Date(a.createdAt || a.dateLost)
      );
    } else if (sortBy === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt || a.dateLost) -
          new Date(b.createdAt || b.dateLost)
      );
    } else if (sortBy === "viewed") {
      filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const handleClaimItem = (itemId) => {
    if (!user) {
      toast.error("Please sign in to claim items");
      return;
    }

    navigate(`/items/${itemId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLocation("");
    setSelectedStatus("");
    setSelectedCondition("");
    setDateFrom("");
    setDateTo("");
    setSortBy("newest");
  };

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedLocation ||
    selectedStatus ||
    selectedCondition ||
    dateFrom ||
    dateTo;

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <Helmet>
        <title>{`Search Lost & Found Items - ${schoolConfig.name}`}</title>
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="mb-6 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 shadow-sm sm:mb-8">
          <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between lg:p-7">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center rounded-full border border-emerald-200 bg-white/85 px-3 py-1 text-xs font-semibold text-emerald-700">
                Search & Discover
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                Search Lost &amp; Found Items
              </h1>

              <p className="mt-2 text-sm leading-6 text-emerald-900/80 sm:text-base">
                Browse verified campus items, refine results fast, and open the
                right item with a cleaner and more focused search experience.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <TopStatCard label="All Items" value={items.length} />
              <TopStatCard label="Results" value={filteredItems.length} />
              <TopStatCard
                label="Filters"
                value={hasActiveFilters ? "On" : "Off"}
              />
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="flex-1">
              <SmartSearchHelper
                onSearchSubmit={(query) => setSearchQuery(query)}
                placeholder="Search by title, description, or category..."
                showSuggestions={true}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                type="button"
                className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
              >
                <FaSlidersH className="text-sm" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  type="button"
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white"
                >
                  <FaTimes className="text-sm" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <FaFilter className="text-sm text-emerald-700" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Filter Results
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterSelect
                  label="Category"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categories}
                  placeholder="All Categories"
                />

                <FilterSelect
                  label="Location"
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  options={locations}
                  placeholder="All Locations"
                />

                <FilterSelect
                  label="Condition"
                  value={selectedCondition}
                  onChange={setSelectedCondition}
                  options={conditions}
                  placeholder="All Conditions"
                />

                <FilterSelect
                  label="Status"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={statuses}
                  placeholder="All Status"
                />

                <FilterInput
                  label="From Date"
                  type="date"
                  value={dateFrom}
                  onChange={setDateFrom}
                />

                <FilterInput
                  label="To Date"
                  type="date"
                  value={dateTo}
                  onChange={setDateTo}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="viewed">Most Viewed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <FilterTag
                  label={`Search: ${searchQuery}`}
                  onRemove={() => setSearchQuery("")}
                />
              )}

              {selectedCategory && (
                <FilterTag
                  label={selectedCategory}
                  onRemove={() => setSelectedCategory("")}
                />
              )}

              {selectedLocation && (
                <FilterTag
                  label={selectedLocation}
                  onRemove={() => setSelectedLocation("")}
                />
              )}

              {selectedCondition && (
                <FilterTag
                  label={selectedCondition}
                  onRemove={() => setSelectedCondition("")}
                />
              )}

              {selectedStatus && (
                <FilterTag
                  label={selectedStatus}
                  onRemove={() => setSelectedStatus("")}
                />
              )}

              {(dateFrom || dateTo) && (
                <FilterTag
                  label={`${dateFrom ? new Date(dateFrom).toLocaleDateString() : "Any"} - ${
                    dateTo ? new Date(dateTo).toLocaleDateString() : "Any"
                  }`}
                  onRemove={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                />
              )}
            </div>
          )}
        </section>

        <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Results</h2>
            <p className="mt-1 text-sm text-slate-500">
              Found {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </p>
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <LoadingItemCard key={idx} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <FaBoxOpen className="text-2xl text-slate-400" />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-900">
              No items found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try adjusting your search, changing the filters, or clearing them.
            </p>

            <button
              onClick={clearFilters}
              type="button"
              className="mt-5 inline-flex items-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {paginatedItems.map((item) => (
                <ItemCard key={item._id} item={item} onClaim={handleClaimItem} />
              ))}
            </div>

            {totalPages > 1 && (
              <PaginationComponent
                currentPage={activePage}
                totalPages={totalPages}
                totalItems={filteredItems.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

function TopStatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-emerald-950">{value}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterInput({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
      />
    </div>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
      {label}
      <button onClick={onRemove} type="button" className="text-emerald-700">
        <FaTimes size={12} />
      </button>
    </span>
  );
}

function LoadingItemCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-52 bg-slate-100" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-2/3 rounded bg-slate-100" />
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-slate-100" />
          <div className="h-6 w-20 rounded-full bg-slate-100" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-5/6 rounded bg-slate-100" />
          <div className="h-3 w-4/6 rounded bg-slate-100" />
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="mb-2 h-3 w-2/3 rounded bg-slate-100" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
        <div className="h-11 w-full rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

function ItemCard({ item, onClaim }) {
  const imageUrl =
    item.images && item.images.length > 0 ? item.images[0] : item.image;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "claimed":
        return "bg-yellow-100 text-yellow-800";
      case "recovered":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case "good":
        return "bg-green-50 text-green-700";
      case "fair":
        return "bg-yellow-50 text-yellow-700";
      case "damaged":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-52 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23e2e8f0" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%2364748b">No Image</text></svg>';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
        )}

        {item.status && (
          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
              item.status
            )}`}
          >
            {item.status}
          </span>
        )}
      </div>

      <div className="flex min-h-[320px] flex-col p-5">
        <div className="mb-3">
          <h3 className="line-clamp-2 text-lg font-semibold leading-7 text-slate-900">
            {item.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {item.category && (
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                {item.category}
              </span>
            )}

            {item.condition && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getConditionColor(
                  item.condition
                )}`}
              >
                {item.condition}
              </span>
            )}
          </div>
        </div>

        <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">
          {item.description}
        </p>

        <div className="mb-5 space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <FaMapMarkerAlt className="text-slate-400" />
            <span className="font-medium text-slate-700">Location:</span>
            <span className="truncate">{item.location || "Unknown"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <FaCalendarAlt className="text-slate-400" />
            <span className="font-medium text-slate-700">Date:</span>
            <span>
              {new Date(item.dateLost || item.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <button
          onClick={() => onClaim(item._id)}
          type="button"
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
        >
          <FaLink size={14} />
          View &amp; Claim
          <FaChevronRight size={12} />
        </button>
      </div>
    </article>
  );
}

export default SearchItems;