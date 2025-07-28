// components/Submissions.js
import { useState, useEffect } from 'react';
import { FiMail, FiUser, FiGlobe, FiClock, FiDownload, FiSearch, FiChevronDown, FiRefreshCw } from 'react-icons/fi';
import { initializeData, fetchFreshData } from '../utils/dataService';

const Submissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error, timestamp } = await initializeData();
        setSubmissions(data);
        setError(error);
        setLastUpdated(timestamp);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Add a refresh button handler
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data, error, timestamp } = await fetchFreshData();
      setSubmissions(data);
      setError(error);
      setLastUpdated(timestamp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyFromEmail = (email) => email?.split('@')[1]?.split('.')[0] || '';

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getSourceWebsite = (sourceSite) => {
    switch(sourceSite?.toLowerCase()) {
      case 'professionaledgeglobal':
        return 'professionaledgeglobal.com.np';
      case 'ssuresh & associates':
      case 'ssureshandassociates':
        return 'ssureshandassociates.com.np';
      default:
        return sourceSite || 'Unknown source';
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Type', 'Name', 'Email', 'Company', 'Subject', 'Source', 'Submitted At'].join(','),
      ...filteredSubmissions.map(submission => [
        submission.id,
        submission.type === 'contact' ? 'Contact Form' : 'Subscription',
        submission.name,
        submission.email,
        getCompanyFromEmail(submission.email),
        submission.subject,
        getSourceWebsite(submission.sourceSite),
        formatDate(submission.submittedAt)
      ].map(field => `"${(field || 'N/A').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `submissions_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      (submission.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (submission.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (submission.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (getSourceWebsite(submission.sourceSite)?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      getCompanyFromEmail(submission.email).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      typeFilter === 'all' || 
      (typeFilter === 'contact' && submission.type === 'contact') ||
      (typeFilter === 'subscription' && submission.type === 'subscription');
    
    return matchesSearch && matchesType;
  });

  if (loading && submissions.length === 0) return <LoadingSpinner />;
  if (error && submissions.length === 0) return <ErrorDisplay error={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Form Submissions</h1>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <span className="mr-3">
                {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'entry' : 'entries'}
              </span>
              <span className="flex items-center">
                <FiClock className="mr-1" size={14} />
                {lastUpdated ? `Last updated ${formatDate(lastUpdated)}` : 'Loading...'}
              </span>
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="ml-3 flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <FiRefreshCw className={`mr-1 ${loading ? 'animate-spin' : ''}`} size={14} />
                {loading ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm"
            disabled={filteredSubmissions.length === 0 || loading}
          >
            <FiDownload className="mr-2" />
            Export CSV
          </button>
        </div>

        {/* Filters Section */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-48 px-3 py-2 bg-white text-sm rounded-lg border border-gray-200 hover:border-gray-300 shadow-xs"
            >
              <span className="text-gray-700">
                {typeFilter === 'all' ? 'All submission types' : 
                 typeFilter === 'contact' ? 'Contact forms only' : 'Subscriptions only'}
              </span>
              <FiChevronDown className={`transition-transform text-gray-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white shadow-lg rounded-md py-1 border border-gray-200">
                <button 
                  onClick={() => { setTypeFilter('all'); setIsDropdownOpen(false); }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                >
                  All submission types
                </button>
                <button 
                  onClick={() => { setTypeFilter('contact'); setIsDropdownOpen(false); }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                >
                  Contact forms only
                </button>
                <button 
                  onClick={() => { setTypeFilter('subscription'); setIsDropdownOpen(false); }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                >
                  Subscriptions only
                </button>
              </div>
            )}
          </div>
          
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, company or source..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">#{submission.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        submission.type === 'contact' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-purple-50 text-purple-700'
                      }`}>
                        {submission.type === 'contact' ? (
                          <>
                            <FiUser className="mr-1.5" size={12} />
                            Contact
                          </>
                        ) : (
                          <>
                            <FiMail className="mr-1.5" size={12} />
                            Subscription
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 border border-blue-100">
                          {submission.name ? submission.name.charAt(0).toUpperCase() : submission.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.name || getCompanyFromEmail(submission.email)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.email}
                          </div>
                          {submission.type === 'contact' && submission.subject && (
                            <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                              "{submission.subject}"
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <a 
                          href={`https://${getSourceWebsite(submission.sourceSite)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center text-blue-600 hover:underline hover:text-blue-800"
                        >
                          <FiGlobe className="mr-1.5" size={14} />
                          {getSourceWebsite(submission.sourceSite)}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        <FiClock className="mr-1.5 flex-shrink-0" size={14} />
                        <span>{formatDate(submission.submittedAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="text-gray-400 flex flex-col items-center">
                      <FiSearch className="h-8 w-8 mb-2" />
                      <p className="text-sm font-medium">No submissions found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Reusable components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-500">Loading submissions...</p>
    </div>
  </div>
);

const ErrorDisplay = ({ error }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Failed to load submissions</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
          >
            Try again →
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default Submissions;