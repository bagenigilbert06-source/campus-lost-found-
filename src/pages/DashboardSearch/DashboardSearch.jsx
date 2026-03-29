import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/Authcontext/AuthContext";
import { Helmet } from "react-helmet-async";
import { schoolConfig } from "../../config/schoolConfig";
import toast from "react-hot-toast";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaBox,
  FaTimes,
  FaMapPin,
  FaCalendarAlt,
  FaTag,
  FaSort,
  FaChevronRight,
  FaBookmark,
} from "react-icons/fa";
import PaginationComponent from "../../components/PaginationComponent";
import BookmarkButton from "../../components/BookmarkButton";
import ImageLightbox from "../../components/ImageLightbox";

const API_BASE = "http://localhost:3001/api";
const ITEMS_PER_PAGE = 12;

// Helper to safely extract string values from potentially problematic API data
const getString = (value) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    return value.name || value.title || value.label || String(value);
  }
  return String(value || '');
};

const DashboardSearch = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("recent");

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedItemImages, setSelectedItemImages] = useState([]);

  const [filters, setFilters] = useState({
    postType: "all",
    status: "all",
    category: "all",
    dateFrom: null,
    dateTo: null,
    condition: "all",
  });

  const categories = useMemo(
    () => [
      "Electronics",
      "Clothing",
      "Books",
      "Accessories",
      "Documents",
      "Other",
    ],
    []
  );

  const postTypes = useMemo(() => ["Lost", "Found"], []);
  const statuses = useMemo(
    () => ["Pending", "Verified", "Recovered", "Unclaimed"],
    []
  );

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    fetchItems();
  }, [user, navigate]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, items, sortBy]);

  const fetchItems = async () => {
    try {
      setLoading(true);

      const res = await axios
        .get(`${API_BASE}/items`, {
          withCredentials: true,
        })
        .catch(() => ({ data: [] }));

      let data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      
      // Filter to show only active items in student search (hide claimed/recovered)
      data = data.filter(item => item.status === 'active' || !item.status);
      
      setItems(data);
    } catch (error) {
      console.error("[DashboardSearch] Error fetching items:", error);
      toast.error("Failed to load items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    if (searchTerm.trim()) {
      const lowered = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          getString(item.title).toLowerCase().includes(lowered) ||
          getString(item.description).toLowerCase().includes(lowered) ||
          getString(item.category).toLowerCase().includes(lowered) ||
          getString(item.location).toLowerCase().includes(lowered)
      );
    }

    if (filters.postType !== "all") {
      filtered = filtered.filter((item) => {
        const type = getString(item.postType || item.itemType).toLowerCase();
        return type === filters.postType.toLowerCase();
      });
    }

    if (filters.category !== "all") {
      filtered = filtered.filter(
        (item) =>
          getString(item.category).toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(
        (item) => getString(item.status).toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.condition !== "all") {
      filtered = filtered.filter(
        (item) =>
          getString(item.condition).toLowerCase() === filters.condition.toLowerCase()
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (item) => new Date(item.createdAt) >= filters.dateFrom
      );
    }

    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (item) => new Date(item.createdAt) <= endDate
      );
    }

    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "title-asc") {
      filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "title-desc") {
      filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSortBy("recent");
    setFilters({
      itemType: "all",
      status: "all",
      category: "all",
      dateFrom: null,
      dateTo: null,
      condition: "all",
    });
  };

  const handleViewDetails = (itemId) => {
    navigate(`/app/items/${itemId}`);
  };

  const hasActiveFilters =
    searchTerm.trim() ||
    filters.itemType !== "all" ||
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.condition !== "all" ||
    filters.dateFrom ||
    filters.dateTo ||
    sortBy !== "recent";

  const handleImageClick = (images) => {
    if (images && images.length > 0) {
      setSelectedItemImages(images);
      setLightboxOpen(true);
    }
  };

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <Helmet>
        <title>{`Search Items - ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 shadow-sm sm:mb-8">
          <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between lg:p-7">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center rounded-full border border-emerald-200 bg-white/85 px-3 py-1 text-xs font-semibold text-emerald-700">
                Search Workspace
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                Search Lost &amp; Found Items
              </h1>

              <p className="mt-2 text-sm leading-6 text-emerald-900/80 sm:text-base">
                Browse campus items with a cleaner, faster, and more organized
                search experience.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatPill label="All Items" value={items.length} />
              <StatPill label="Results" value={filteredItems.length} />
              <StatPill label="Per Page" value={ITEMS_PER_PAGE} />
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, description, category, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  type="button"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Post Type"
              value={filters.postType}
              onChange={(value) => updateFilter("postType", value)}
              options={postTypes}
              allLabel="All"
              icon={<FaFilter className="h-3.5 w-3.5" />}
            />

            <FilterSelect
              label="Category"
              value={filters.category}
              onChange={(value) => updateFilter("category", value)}
              options={categories}
              allLabel="All"
              icon={<FaTag className="h-3.5 w-3.5" />}
            />

            <FilterSelect
              label="Status"
              value={filters.status}
              onChange={(value) => updateFilter("status", value)}
              options={statuses}
              allLabel="All"
              icon={<FaFilter className="h-3.5 w-3.5" />}
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FaSort className="h-3.5 w-3.5" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <ActiveTag
                  label={`Search: ${searchTerm}`}
                  onRemove={() => setSearchTerm("")}
                />
              )}
              {filters.postType !== "all" && (
                <ActiveTag
                  label={`Type: ${filters.postType}`}
                  onRemove={() => updateFilter("postType", "all")}
                />
              )}
              {filters.category !== "all" && (
                <ActiveTag
                  label={`Category: ${filters.category}`}
                  onRemove={() => updateFilter("category", "all")}
                />
              )}
              {filters.status !== "all" && (
                <ActiveTag
                  label={`Status: ${filters.status}`}
                  onRemove={() => updateFilter("status", "all")}
                />
              )}
              {filters.dateFrom && (
                <ActiveTag
                  label={`From: ${filters.dateFrom.toLocaleDateString()}`}
                  onRemove={() => updateFilter("dateFrom", null)}
                />
              )}
              {filters.dateTo && (
                <ActiveTag
                  label={`To: ${filters.dateTo.toLocaleDateString()}`}
                  onRemove={() => updateFilter("dateTo", null)}
                />
              )}
              {sortBy !== "recent" && (
                <ActiveTag
                  label={`Sort: ${sortBy}`}
                  onRemove={() => setSortBy("recent")}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <LoadingCard key={idx} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100">
              <FaBox className="h-8 w-8 text-slate-400" />
            </div>
            <p className="mb-2 text-lg font-semibold text-slate-900">
              No items found
            </p>
            <p className="text-sm text-slate-500">
              Try changing your search or clearing some filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-5 inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
              type="button"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedItems.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onOpen={() => handleViewDetails(item._id)}
                  onImageClick={handleImageClick}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredItems.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      <ImageLightbox 
        images={selectedItemImages} 
        isOpen={lightboxOpen} 
        onClose={() => setLightboxOpen(false)} 
      />
    </>
  );
};

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-white/80 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-emerald-950">{value}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, allLabel, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
      >
        <option value="all">{allLabel}</option>
        {options.map((option) => {
          const optionStr = getString(option);
          return (
            <option key={optionStr} value={optionStr.toLowerCase()}>
              {optionStr}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function ActiveTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
      {label}
      <button
        onClick={onRemove}
        type="button"
        className="text-emerald-700"
        aria-label={`Remove ${label}`}
      >
        <FaTimes size={12} />
      </button>
    </span>
  );
}

function LoadingCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="h-44 bg-slate-100" />
      <div className="space-y-4 p-4">
        <div className="h-5 w-2/3 rounded bg-slate-100" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-4/5 rounded bg-slate-100" />
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-md bg-slate-100" />
          <div className="h-6 w-24 rounded-md bg-slate-100" />
        </div>
        <div className="h-10 w-full rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

function ItemCard({ item, onOpen, onImageClick }) {
  const imageUrl =
    item.images && item.images[0] ? item.images[0] : item.image || null;
  const allImages = item.images || (item.image ? [item.image] : []);

  const isLost = getString(item.itemType).toLowerCase() === "lost";
  const status = item.status ? getString(item.status) : "Unclaimed";

  return (
    <article
      className="cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      onClick={onOpen}
    >
      <div className="relative h-44 border-b border-slate-100 bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={getString(item.title)}
            className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onImageClick(allImages);
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <FaBox className="h-10 w-10" />
          </div>
        )}

        <div
          className={`absolute right-2 top-2 rounded-md px-2.5 py-1 text-[11px] font-semibold text-white ${
            isLost ? "bg-orange-500" : "bg-emerald-600"
          }`}
        >
          {getString(item.itemType) || "Item"}
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-2 top-2"
          role="button"
          tabIndex={0}
          aria-label="Bookmark item"
        >
          <BookmarkButton itemId={item._id} size="md" />
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-900">
            {getString(item.title)}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
            {getString(item.description)}
          </p>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {item.category && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
              <FaTag className="h-3 w-3" />
              {getString(item.category)}
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${
              getString(status).toLowerCase() === "recovered"
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <FaBookmark className="h-3 w-3" />
            {status}
          </span>
        </div>

        <div className="mb-4 space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
          {item.location && (
            <div className="flex items-center gap-2">
              <FaMapPin className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate">{getString(item.location)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <FaCalendarAlt className="h-3.5 w-3.5 text-slate-400" />
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          type="button"
        >
          View Details
          <FaChevronRight className="h-3 w-3" />
        </button>
      </div>
    </article>
  );
}

export default DashboardSearch;
