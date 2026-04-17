import { useState, useMemo } from 'react';
import { FiMail, FiUser, FiGlobe, FiClock, FiDownload, FiRefreshCw, FiChevronDown, FiTrash2 } from 'react-icons/fi';
import useDataFetch from '../hooks/useDataFetch';
import DataTable from '../components/tables/DataTable';
import SearchInput from '../components/forms/SearchInput';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import SubmissionModal from '../components/ui/SubmissionModal';

const Submissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const { data: submissions, loading, error, lastUpdated, refresh, deleteItem } = useDataFetch();

  /* ── Helpers ── */
  const getCompanyFromEmail = (email) => email?.split('@')[1]?.split('.')[0] || '';

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return '—'; }
  };

  const getSiteBadgeVariant = (site) => {
    const s = site.toLowerCase();
    if (s.includes('professionaledge')) return 'primary';
    if (s.includes('ssureshandassociates')) return 'warning';
    return 'gray';
  };

  /* ── Filtering ── */
  const uniqueSites = useMemo(() => {
    const sites = submissions.map(s => s.sourceSite).filter(Boolean);
    return ['all', ...Array.from(new Set(sites))];
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const q = searchTerm.toLowerCase();
      const site = s.sourceSite;
      
      const matchesSearch =
        (s.name?.toLowerCase() || '').includes(q) ||
        (s.email?.toLowerCase() || '').includes(q) ||
        (s.subject?.toLowerCase() || '').includes(q) ||
        (site?.toLowerCase() || '').includes(q) ||
        getCompanyFromEmail(s.email).toLowerCase().includes(q);
      
      const matchesType = typeFilter === 'all' || s.type === typeFilter;
      const matchesSite = siteFilter === 'all' || site === siteFilter;
      
      return matchesSearch && matchesType && matchesSite;
    });
  }, [submissions, searchTerm, typeFilter, siteFilter]);

  /* ── Handles ── */
  const handleDelete = (e, id) => {
    e.stopPropagation(); // Prevent opening detail modal
    if (window.confirm('Are you sure you want to remove this submission from your view? (This will not affect the source Google Sheet)')) {
      deleteItem(id);
    }
  };

  /* ── Export ── */
  const handleExport = () => {
    const csvContent = [
      ['ID', 'Type', 'Name', 'Email', 'Company', 'Subject', 'Source', 'Submitted At'].join(','),
      ...filteredSubmissions.map((s) =>
        [s.id, s.type === 'contact' ? 'Contact Form' : 'Subscription', s.name, s.email,
         getCompanyFromEmail(s.email), s.subject, s.sourceSite, formatDate(s.submittedAt)
        ].map((f) => `"${(f || 'N/A').toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ── Table columns ── */
  const columns = [
    {
      key: 'id', label: 'ID', className: 'whitespace-nowrap',
      render: (row) => <span className="font-mono text-gray-400 dark:text-gray-600 font-medium">#{row.id}</span>
    },
    {
      key: 'type', label: 'Type', className: 'whitespace-nowrap',
      render: (row) => (
        <Badge variant={row.type === 'contact' ? 'info' : 'primary'}>
          {row.type === 'contact' ? <><FiUser className="mr-1 w-3 h-3 inline" />Contact</> : <><FiMail className="mr-1 w-3 h-3 inline" />Subscription</>}
        </Badge>
      )
    },
    {
      key: 'contact', label: 'Contact',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold shrink-0 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
            {(row.name || row.email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{row.name || getCompanyFromEmail(row.email)}</p>
            <p className="text-xs text-gray-500 truncate dark:text-gray-400">{row.email}</p>
            {row.type === 'contact' && row.subject && (
              <p className="text-xs text-gray-400 truncate mt-0.5 dark:text-gray-500 italic">"{row.subject}"</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'source', label: 'Website Source', className: 'whitespace-nowrap',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={getSiteBadgeVariant(row.sourceSite)}>
            <FiGlobe className="mr-1.5 w-3 h-3 inline" />
            {row.sourceSite}
          </Badge>
        </div>
      )
    },
    {
      key: 'date', label: 'Submitted At', className: 'whitespace-nowrap',
      render: (row) => (
        <span className="flex items-center gap-1.5 text-gray-500 text-xs dark:text-gray-400">
          <FiClock className="w-3.5 h-3.5" />{formatDate(row.submittedAt)}
        </span>
      )
    },
    {
      key: 'actions', label: '', className: 'text-right',
      render: (row) => (
        <button
          onClick={(e) => handleDelete(e, row.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
          title="Remove from view"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All types' },
    { value: 'contact', label: 'Contact' },
    { value: 'subscription', label: 'Subscription' },
  ];

  if (loading && submissions.length === 0) return <Loader text="Loading submissions..." />;

  if (error && submissions.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 dark:bg-red-900/10 dark:border-red-900/30 transition-colors">
        <p className="text-sm font-medium text-red-800 dark:text-red-400">Failed to load submissions</p>
        <p className="text-sm text-red-700 mt-1 dark:text-red-500/70">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors">
          Try again →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Submissions</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'entry' : 'entries'}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
            <span className="flex items-center gap-1">
              <FiClock className="w-3.5 h-3.5" />
              {lastUpdated ? formatDate(lastUpdated) : '—'}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing' : 'Refresh'}
            </button>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport} disabled={filteredSubmissions.length === 0 || loading}>
          <FiDownload className="w-3.5 h-3.5 mr-1.5" />Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900/50 p-1 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
        {/* Type dropdown */}
        <div className="relative">
          <button
            onClick={() => { setIsTypeDropdownOpen(!isTypeDropdownOpen); setIsSiteDropdownOpen(false); }}
            className="flex items-center justify-between min-w-[140px] px-3 py-2 bg-gray-50/50 dark:bg-slate-800/50 text-sm rounded-lg border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all text-gray-700 dark:text-gray-300"
          >
            <span>{filterOptions.find(o => o.value === typeFilter)?.label}</span>
            <FiChevronDown className={`ml-2 text-gray-400 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isTypeDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full min-w-[140px] bg-white dark:bg-slate-800 shadow-xl rounded-lg py-1 border border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-1 duration-200">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setTypeFilter(opt.value); setIsTypeDropdownOpen(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${typeFilter === opt.value ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Website dropdown */}
        <div className="relative">
          <button
            onClick={() => { setIsSiteDropdownOpen(!isSiteDropdownOpen); setIsTypeDropdownOpen(false); }}
            className="flex items-center justify-between min-w-[200px] px-3 py-2 bg-gray-50/50 dark:bg-slate-800/50 text-sm rounded-lg border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all text-gray-700 dark:text-gray-300"
          >
            <span className="truncate max-w-[160px]">{siteFilter === 'all' ? 'All Websites' : siteFilter}</span>
            <FiChevronDown className={`ml-2 text-gray-400 transition-transform duration-200 ${isSiteDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isSiteDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full min-w-[200px] bg-white dark:bg-slate-800 shadow-xl rounded-lg py-1 border border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-1 duration-200">
              {uniqueSites.map((site) => (
                <button
                  key={site}
                  onClick={() => { setSiteFilter(site); setIsSiteDropdownOpen(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${siteFilter === site ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                >
                  {site === 'all' ? 'All Websites' : site}
                </button>
              ))}
            </div>
          )}
        </div>

        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search submissions..."
          className="flex-grow max-w-md"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredSubmissions}
        rowKey="id"
        emptyMessage="No submissions match your current filters."
        onRowClick={(row) => setSelectedSubmission(row)}
      />

      {/* Detail Modal */}
      <SubmissionModal 
        isOpen={!!selectedSubmission} 
        submission={selectedSubmission} 
        onClose={() => setSelectedSubmission(null)} 
      />
    </div>
  );
};

export default Submissions;