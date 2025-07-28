// components/Dashboard.js
import { useState, useEffect } from 'react';
import { initializeData, fetchFreshData } from '../utils/dataService';

const Dashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isUsingCache, setIsUsingCache] = useState(false);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { data, error, timestamp, isCached } = await initializeData();
        
        setSubmissions(data || []);
        setError(error);
        setLastUpdated(timestamp);
        setIsUsingCache(isCached);
        
        if (isCached) {
          // If using cached data, try to fetch fresh data in background
          const freshData = await fetchFreshData();
          if (freshData.data && !freshData.error) {
            setSubmissions(freshData.data);
            setLastUpdated(freshData.timestamp);
            setIsUsingCache(false);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Add a refresh button handler
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const { data, error, timestamp } = await fetchFreshData();
      setSubmissions(data || []);
      setError(error);
      setLastUpdated(timestamp);
      setIsUsingCache(false);
    } catch (err) {
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && submissions.length === 0) return <LoadingSpinner />;
  if (error && submissions.length === 0) return <ErrorDisplay error={error} />;

  // Normalize source names and group by them
  const normalizeSourceName = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('suresh') || lowerName.includes('ssuresh')) {
      return 'S. Suresh & Associates';
    }
    if (lowerName.includes('professional') || lowerName.includes('edge') || lowerName.includes('global')) {
      return 'Professional Edge Global';
    }
    return name;
  };

  const getSourceUrl = (name) => {
    const normalized = normalizeSourceName(name);
    if (normalized === 'S. Suresh & Associates') return 'https://ssureshandassociates.com.np';
    if (normalized === 'Professional Edge Global') return 'https://professionaledgeglobal.com.np';
    return name; // fallback to original if not one of our special cases
  };

  const stats = [
    { name: 'Total Submissions', value: submissions.length, icon: '📋' },
    { name: 'Source Websites', value: [...new Set(submissions.map(s => normalizeSourceName(s.sourceSite)))].length, icon: '🌐' },
    { name: 'Contact Forms', value: submissions.filter(s => s.type === 'contact').length, icon: '✉️' },
    { name: 'Subscriptions', value: submissions.filter(s => s.type === 'subscription').length, icon: '📩' }
  ];

  const submissionsBySource = submissions.reduce((acc, submission) => {
    const normalizedSource = normalizeSourceName(submission.sourceSite);
    if (!acc[normalizedSource]) {
      acc[normalizedSource] = { 
        url: getSourceUrl(submission.sourceSite), 
        submissions: [] 
      };
    }
    acc[normalizedSource].submissions.push(submission);
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Submission Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of all form submissions</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <div className="flex flex-col items-end">
              <span className="text-xs md:text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleString()}
              </span>
              {isUsingCache && (
                <span className="text-xs text-yellow-600">
                  Showing cached data - refreshing in background...
                </span>
              )}
            </div>
          )}
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm font-medium transition-colors ${
              loading 
                ? 'bg-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.name} stat={stat} />
        ))}
      </div>

      {/* Error Display */}
      {error && <ErrorDisplay error={error} />}

      {/* Submissions by Source */}
      {Object.entries(submissionsBySource).map(([sourceSite, { url, submissions }]) => (
        <div key={sourceSite} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{sourceSite}</h2>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs md:text-sm text-blue-600 hover:underline flex items-center"
              >
                <span className="truncate max-w-xs">{url}</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full whitespace-nowrap">
              {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <TableRow key={submission.id} submission={submission} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorDisplay = ({ error }) => (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
    <div className="flex items-start">
      <div className="flex-shrink-0 pt-0.5">
        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
        <p className="text-sm text-yellow-700 mt-1">{error}</p>
      </div>
    </div>
  </div>
);

const StatCard = ({ stat }) => (
  <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-200 hover:shadow-sm transition-shadow">
    <div className="flex items-start">
      <span className="text-2xl mr-3">{stat.icon}</span>
      <div>
        <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">{stat.name}</h3>
        <p className="mt-1 text-xl font-semibold text-gray-900">{stat.value.toLocaleString()}</p>
      </div>
    </div>
  </div>
);

const TableRow = ({ submission }) => (
  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
    <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
        submission.type === 'contact' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-purple-100 text-purple-800'
      }`}>
        {submission.type === 'contact' ? 'Contact Form' : 'Subscription'}
      </span>
    </td>
    <td className="px-4 py-3 md:px-6 md:py-4">
      {submission.type === 'contact' ? (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{submission.name || 'No name provided'}</div>
          <div className="text-sm text-gray-500">{submission.email}</div>
          {submission.subject && (
            <div className="text-sm">
              <div className="font-medium text-gray-700">{submission.subject}</div>
              <div className="text-gray-500 mt-1 line-clamp-2">{submission.message}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{submission.email}</div>
          <div>
            <span className={`px-2 py-0.5 inline-flex items-center rounded-full text-xs font-medium ${
              submission.subscribed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {submission.subscribed ? 'Subscribed' : 'Unsubscribed'}
            </span>
          </div>
        </div>
      )}
    </td>
    <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
      {new Date(submission.submittedAt).toLocaleString()}
    </td>
  </tr>
);

export default Dashboard;