import React from 'react';

const AdminTable = ({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = 'No data available',
  onRowClick 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="animate-pulse">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-4 bg-slate-200 rounded w-24"></div>
              ))}
            </div>
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="px-6 py-4 border-b border-slate-50">
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="h-4 bg-slate-100 rounded w-24"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {columns.map((column, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, rowIdx) => (
              <tr 
                key={row._id || rowIdx} 
                className={`hover:bg-slate-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 ${column.cellClassName || ''}`}>
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
