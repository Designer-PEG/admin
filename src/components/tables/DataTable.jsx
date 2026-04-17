import { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * A generic, paginated data table.
 * @param {Object[]} columns - Array of { key, label, render?, className? }
 * @param {Object[]} data - The full (already filtered) dataset
 * @param {string} rowKey - Property name to use as the React key for each row
 * @param {string} emptyMessage - Message when no data
 */
const DataTable = ({ columns, data, rowKey = 'id', emptyMessage = 'No data found', onRowClick }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when data changes
  const totalPages = Math.ceil(data.length / pageSize);
  const safeCurrentPage = Math.min(page, Math.max(totalPages - 1, 0));

  const paginatedData = useMemo(() => {
    const start = safeCurrentPage * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safeCurrentPage, pageSize]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200 shadow-sm">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr 
                  key={row[rowKey]} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors dark:hover:bg-slate-800/30 ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50/50'}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-6 py-4 text-sm dark:text-gray-300 ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-400 dark:text-gray-600">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50/50 truncate gap-3 dark:border-slate-800 dark:bg-slate-800/30">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              className="border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="text-gray-400 dark:text-gray-600">
              {safeCurrentPage * pageSize + 1}–{Math.min((safeCurrentPage + 1) * pageSize, data.length)} of {data.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={safeCurrentPage === 0}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-slate-700"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 px-2 dark:text-gray-400">
              Page {safeCurrentPage + 1} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={safeCurrentPage >= totalPages - 1}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-slate-700"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
