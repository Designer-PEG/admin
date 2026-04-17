import { useEffect, useState, useMemo } from 'react';
import { FiRefreshCw, FiExternalLink, FiClock, FiAlertCircle } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import DataTable from '../components/tables/DataTable';

const TrainingForm = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbzIINicPMtjJfimpnnciWj7nYlG34jsu8Hi8rL3XIQ7mr6AOGvaeUH5vK6_r4ZsZilXJQ/exec?sheet=Sheet1'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!Array.isArray(result) || !result.every(Array.isArray)) {
        throw new Error('Invalid data format: Expected 2D array');
      }
      
      setSubmissions(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching submissions:', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Transform 2D array to Objects for DataTable
  const { columns, data } = useMemo(() => {
    if (submissions.length === 0) return { columns: [], data: [] };

    const headers = submissions[0];
    const rows = submissions.slice(1);

    const cols = headers.map((header, index) => ({
      key: `col_${index}`,
      label: header,
      render: (row) => <span className="text-sm text-gray-900 dark:text-gray-200">{row[`col_${index}`] || '—'}</span>
    }));

    const tableData = rows.map((row, rowIndex) => {
      const rowObj = { id: rowIndex };
      row.forEach((cell, cellIndex) => {
        rowObj[`col_${cellIndex}`] = cell;
      });
      return rowObj;
    });

    return { columns: cols, data: tableData };
  }, [submissions]);

  if (loading && submissions.length === 0) {
    return <Loader text="Loading training submissions..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Training Form Submissions</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span>{data.length} {data.length === 1 ? 'submission' : 'submissions'}</span>
            {lastUpdated && (
              <span className="flex items-center gap-1">
                <FiClock className="w-3.5 h-3.5" />
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={fetchSubmissions} isLoading={loading}>
            <FiRefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <a
            href="https://docs.google.com/spreadsheets/d/1B9R7-u2B8R58bE_Xy9V3Q0-T8vUj-8_0-v1_O_W-Y/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FiExternalLink className="mr-1.5" /> View Sheet
          </a>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p className="font-semibold">Failed to fetch data</p>
            <p>{error}</p>
            <button
              onClick={fetchSubmissions}
              className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={data}
        rowKey="id"
        emptyMessage="No training submissions found."
      />
    </div>
  );
};

export default TrainingForm;