import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FaSearch,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTag,
  FaSpinner,
  FaSyncAlt,
  FaCheckCircle,
} from "react-icons/fa";
import AuthContext from "../../context/Authcontext/AuthContext";
import { itemsService } from "../../services/apiService";
import { schoolConfig } from "../../config/schoolConfig";
import ImageLightbox from "../../components/ImageLightbox";

const MAX_REASON_COUNT = 3;

const getPrimaryImage = (item) => {
  if (!item) return null;

  if (Array.isArray(item.images) && item.images.length > 0) {
    const firstImage = item.images[0];
    if (typeof firstImage === "string") return firstImage;
    if (firstImage?.url) return firstImage.url;
    if (firstImage?.secure_url) return firstImage.secure_url;
  }

  if (typeof item.image === "string") return item.image;
  if (typeof item.picture === "string") return item.picture;
  if (typeof item.imageUrl === "string") return item.imageUrl;

  return null;
};

const getItemImages = (item) => {
  if (!item) return [];

  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images
      .map((img) => {
        if (typeof img === "string") return img;
        return img?.url || img?.secure_url || null;
      })
      .filter(Boolean);
  }

  return [item.image, item.picture, item.imageUrl].filter(Boolean);
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const normalizeMatch = (match, userItem) => {
  const baseUserItem = match?.userItem || match?.lostItem || match?.foundItem || userItem || null;
  const matchedItem =
    baseUserItem?.itemType === "Lost" || baseUserItem?.itemType === "lost"
      ? match?.foundItem
      : match?.lostItem;

  return {
    ...match,
    userItem: baseUserItem,
    matchedItem,
    normalizedScore: Number(match?.score || 0),
  };
};

const getMatchTone = (score) => {
  if (score >= 0.8) {
    return {
      badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      ring: "ring-emerald-100",
      text: "Excellent Match",
    };
  }

  if (score >= 0.6) {
    return {
      badge: "bg-lime-50 text-lime-700 border border-lime-200",
      ring: "ring-lime-100",
      text: "Good Match",
    };
  }

  if (score >= 0.4) {
    return {
      badge: "bg-amber-50 text-amber-700 border border-amber-200",
      ring: "ring-amber-100",
      text: "Possible Match",
    };
  }

  return {
    badge: "bg-rose-50 text-rose-700 border border-rose-200",
    ring: "ring-rose-100",
    text: "Low Match",
  };
};

const MatchCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div className="p-4 sm:p-5 animate-pulse">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="h-6 w-28 rounded-full bg-base-200" />
          <div className="h-4 w-12 rounded bg-base-200" />
        </div>

        <div className="mb-4 h-44 w-full rounded-2xl bg-base-200" />

        <div className="space-y-4">
          <div>
            <div className="mb-2 h-4 w-20 rounded bg-base-200" />
            <div className="mb-2 h-4 w-3/4 rounded bg-base-200" />
            <div className="h-3 w-1/2 rounded bg-base-200" />
          </div>

          <div>
            <div className="mb-2 h-4 w-24 rounded bg-base-200" />
            <div className="mb-2 h-4 w-4/5 rounded bg-base-200" />
            <div className="h-3 w-2/3 rounded bg-base-200" />
          </div>

          <div className="rounded-2xl border border-base-200 p-3">
            <div className="mb-2 h-3 w-14 rounded bg-base-200" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-base-200" />
              <div className="h-3 w-5/6 rounded bg-base-200" />
              <div className="h-3 w-2/3 rounded bg-base-200" />
            </div>
          </div>

          <div className="h-10 w-full rounded-xl bg-base-200" />
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onRefresh, isRefreshing }) => {
  return (
    <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 px-6 py-14 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200/70">
        <FaSearch className="text-2xl text-base-content/50" />
      </div>

      <h3 className="text-xl font-semibold text-base-content">No matches found yet</h3>

      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-base-content/70 sm:text-base">
        We are still checking your lost and found posts for possible matches. New matches will appear
        here automatically when similar items are found.
      </p>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="btn btn-outline mt-6 rounded-xl"
      >
        {isRefreshing ? <FaSpinner className="animate-spin" /> : <FaSyncAlt />}
        Refresh matches
      </button>
    </div>
  );
};

const MatchCard = React.memo(function MatchCard({ match, onViewItem, onOpenLightbox }) {
  const userItem = match.userItem;
  const matchedItem = match.matchedItem;
  const matchedItemImage = getPrimaryImage(matchedItem);
  const matchedItemImages = getItemImages(matchedItem);
  const tone = getMatchTone(match.normalizedScore);

  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all duration-200 hover:border-base-300 hover:shadow-md ${tone.ring} hover:ring-4`}
    >
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}
          >
            <FaCheckCircle className="text-[10px]" />
            {tone.text}
          </span>

          <span className="text-sm font-semibold text-base-content/70">
            {Math.round(match.normalizedScore * 100)}%
          </span>
        </div>

        <div className="mb-3 rounded-xl border border-base-200 bg-base-100 px-3 py-2 text-sm">
          <div className="font-semibold text-base-content">{matchedItem?.title || "Matched item not available"}</div>
          <div className="mt-1 text-xs text-base-content/60">
            {matchedItem?.location || "Location unknown"} • {formatDate(matchedItem?.dateLost || matchedItem?.dateFound || matchedItem?.createdAt)}
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-base-200 bg-base-50/50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
              Your item
            </p>

            <h3 className="line-clamp-1 text-sm font-semibold text-base-content">
              {userItem?.title || "Unknown item"}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-base-content/65">
              <span className="inline-flex items-center gap-1.5">
                <FaTag className="text-[10px]" />
                {userItem?.category || "Unknown category"}
              </span>

              <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-medium text-base-content/70">
                {userItem?.itemType || "N/A"}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-base-200 bg-base-50/50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
              Matched item
            </p>

            <h3 className="line-clamp-1 text-sm font-semibold text-base-content">
              {matchedItem?.title || "Unknown matched item"}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-base-content/65">
              <span className="inline-flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-[10px]" />
                {matchedItem?.location || "Unknown location"}
              </span>

              <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-medium text-base-content/70">
                {matchedItem?.itemType || "N/A"}
              </span>
            </div>

            <p className="mt-2 text-xs text-base-content/55">
              Reported: {formatDate(matchedItem?.dateLost || matchedItem?.dateFound || matchedItem?.createdAt)}
            </p>
          </section>

          {Array.isArray(match.reasons) && match.reasons.length > 0 && (
            <section className="rounded-2xl border border-base-200 bg-base-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                Why this matched
              </p>

              <ul className="space-y-1.5 text-xs leading-5 text-base-content/70">
                {match.reasons.slice(0, MAX_REASON_COUNT).map((reason, index) => (
                  <li key={`${reason}-${index}`} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => matchedItem?._id && onViewItem(matchedItem._id)}
            disabled={!matchedItem?._id}
            className="btn btn-outline w-full rounded-xl"
          >
            <FaEnvelope />
            View matched item / contact owner
          </button>
        </div>
      </div>
    </article>
  );
});

const MatchesPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [error, setError] = useState("");

  const isMountedRef = useRef(true);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleOpenItemDetails = useCallback(
    (itemId) => {
      if (!itemId) return;
      navigate(`/items/${itemId}`);
    },
    [navigate]
  );

  const handleOpenLightbox = useCallback((images = []) => {
    setLightboxImages(images);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setLightboxImages([]);
  }, []);

  const fetchUserMatches = useCallback(
    async ({ silent = false } = {}) => {
      if (!user) {
        if (isMountedRef.current) {
          setMatches([]);
          setLoading(false);
          setRefreshing(false);
          setError("");
        }
        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const userId = user.uid || user.email;
        const userItemsResponse = await itemsService.getUserItems(userId);

        const userItems = Array.isArray(userItemsResponse)
          ? userItemsResponse
          : Array.isArray(userItemsResponse?.items)
          ? userItemsResponse.items
          : [];

        if (userItems.length === 0) {
          if (!isMountedRef.current) return;
          setMatches([]);
          hasLoadedOnceRef.current = true;
          return;
        }

        const settledResults = await Promise.allSettled(
          userItems.map(async (item) => {
            const matchResponse = await itemsService.getItemMatches(item._id);
            const itemMatches = Array.isArray(matchResponse)
              ? matchResponse
              : Array.isArray(matchResponse?.matches)
              ? matchResponse.matches
              : [];

            return itemMatches.map((match) => normalizeMatch(match, item));
          })
        );

        const allMatches = settledResults
          .filter((result) => result.status === "fulfilled")
          .flatMap((result) => result.value)
          .filter(Boolean)
          .sort((a, b) => b.normalizedScore - a.normalizedScore);

        if (!isMountedRef.current) return;

        setMatches(allMatches);
        hasLoadedOnceRef.current = true;
      } catch (err) {
        console.error("Failed to fetch matches:", err);

        if (!isMountedRef.current) return;

        setError("Unable to load item matches right now. Please try again.");
        setMatches([]);
      } finally {
        if (!isMountedRef.current) return;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchUserMatches();
  }, [fetchUserMatches]);

  const stats = useMemo(() => {
    const total = matches.length;
    const strong = matches.filter((item) => item.normalizedScore >= 0.8).length;
    const good = matches.filter((item) => item.normalizedScore >= 0.6 && item.normalizedScore < 0.8).length;

    return { total, strong, good };
  }, [matches]);

  return (
    <>
      <Helmet>
        <title>{`Item Matches - ${schoolConfig.name}`}</title>
        <meta
          name="description"
          content="View potential matches for your lost and found items"
        />
      </Helmet>

      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
                Item Matches
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-base-content/70 sm:text-base">
                See possible matches for your lost and found items. This page is optimized to load
                faster, feel smoother, and stay clean on both desktop and mobile.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-base-200 bg-base-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-base-content/50">Total</p>
                <p className="mt-1 text-lg font-bold text-base-content">{stats.total}</p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-emerald-600/80">Excellent</p>
                <p className="mt-1 text-lg font-bold text-emerald-700">{stats.strong}</p>
              </div>

              <div className="rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-lime-600/80">Good</p>
                <p className="mt-1 text-lg font-bold text-lime-700">{stats.good}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fetchUserMatches({ silent: true })}
              disabled={refreshing || loading}
              className="btn btn-outline rounded-xl"
            >
              {refreshing ? <FaSpinner className="animate-spin" /> : <FaSyncAlt />}
              Refresh matches
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </div>
        ) : matches.length === 0 ? (
          <EmptyState onRefresh={() => fetchUserMatches({ silent: true })} isRefreshing={refreshing} />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((match, index) => {
              const key =
                match?._id ||
                `${match?.userItem?._id || "user"}-${match?.matchedItem?._id || "matched"}-${index}`;

              return (
                <MatchCard
                  key={key}
                  match={match}
                  onViewItem={handleOpenItemDetails}
                  onOpenLightbox={handleOpenLightbox}
                />
              );
            })}
          </div>
        )}

        <ImageLightbox
          images={lightboxImages}
          isOpen={lightboxOpen}
          onClose={closeLightbox}
        />
      </div>
    </>
  );
};

export default MatchesPage;