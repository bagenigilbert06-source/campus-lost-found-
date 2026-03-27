import React from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  maxVisible = 5,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pages = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      {/* Info Text */}
      <p className="text-sm text-slate-600">
        Showing {startItem} to {endItem} of {totalItems} items
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <motion.button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Previous page"
        >
          <FaChevronLeft size={16} />
        </motion.button>

        {/* First Page */}
        {pages[0] > 1 && (
          <>
            <motion.button
              onClick={() => handlePageClick(1)}
              className="w-10 h-10 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              1
            </motion.button>
            {pages[0] > 2 && <span className="text-slate-400 px-1">...</span>}
          </>
        )}

        {/* Page Numbers */}
        {pages.map((page) => (
          <motion.button
            key={page}
            onClick={() => handlePageClick(page)}
            className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
              currentPage === page
                ? 'bg-emerald-600 text-white border border-emerald-600'
                : 'border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {page}
          </motion.button>
        ))}

        {/* Last Page */}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="text-slate-400 px-1">...</span>
            )}
            <motion.button
              onClick={() => handlePageClick(totalPages)}
              className="w-10 h-10 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {totalPages}
            </motion.button>
          </>
        )}

        {/* Next Button */}
        <motion.button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Next page"
        >
          <FaChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  );
};

export default PaginationComponent;
