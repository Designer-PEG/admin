import { useMemo, useState } from 'react';
import { FiFileText, FiGlobe, FiMail, FiInbox, FiRefreshCw, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import useDataFetch from '../hooks/useDataFetch';
import StatsCard from '../components/cards/StatsCard';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import SubmissionModal from '../components/ui/SubmissionModal';

/* ── Computed stats ── */
const Dashboard = () => {
  const { data: submissions, loading, error, lastUpdated, isUsingCache, refresh, deleteItem } = useDataFetch();
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  /* ── Computed stats ── */
  const stats = useMemo(() => [
    { title: 'Total Submissions', value: submissions.length, icon: FiFileText },
    { title: 'Source Websites', value: [...new Set(submissions.map((s) => s.sourceSite))].length, icon: FiGlobe },
    { title: 'Contact Forms', value: submissions.filter((s) => s.type === 'contact').length, icon: FiMail },
    { title: 'Subscriptions', value: submissions.filter((s) => s.type === 'subscription').length, icon: FiInbox },
  ], [submissions]);

  /* ── Group by source ── */
  const submissionsBySource = useMemo(() => {
    return submissions.reduce((acc, sub) => {
      const key = sub.sourceSite;
      if (!acc[key]) acc[key] = { url: sub.sourceUrl || '#', items: [] };
      acc[key].items.push(sub);
      return acc;
    }, {});
  }, [submissions]);

  /* ── Handles ── */
  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this submission from your view?')) {
      deleteItem(id);
    }
  };

  /* ── Early states ── */
  if (loading && submissions.length === 0) return <Loader text="Loading dashboard..." />;
  if (error && submissions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <p className="text-sm text-yellow-800 font-medium">⚠ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time overview of all website form submissions</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Last update: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {isUsingCache && (
            <Badge variant="warning">Cached</Badge>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={refresh}
            isLoading={loading}
          >
            <FiRefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatsCard key={s.title} title={s.title} value={s.value} icon={s.icon} />
        ))}
      </div>

      {/* ── Inline error ── */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 dark:bg-yellow-900/10 dark:border-yellow-900/30 dark:text-yellow-500 transition-colors">
          <span className="font-semibold mr-1">Notice:</span> {error}
        </div>
      )}

      {/* ── Sources breakdown ── */}
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(submissionsBySource).map(([source, { url, items }]) => (
          <div key={source} className="bg-white rounded-xl border border-gray-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800 transition-colors shadow-sm">
            {/* Source header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 dark:border-slate-800 dark:bg-slate-800/30">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{source}</h2>
              </div>
              <Badge variant="info">{items.length} {items.length === 1 ? 'entry' : 'entries'}</Badge>
            </div>

            {/* Source table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/20">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Details</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Received</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {items.map((sub) => (
                    <tr 
                      key={sub.id} 
                      onClick={() => setSelectedSubmission(sub)}
                      className="hover:bg-gray-50 transition-colors dark:hover:bg-slate-800/30 cursor-pointer"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Badge variant={sub.type === 'contact' ? 'info' : 'primary'}>
                          {sub.type === 'contact' ? 'Contact' : 'Subscription'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {sub.type === 'contact' ? (
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-200">{sub.name || '—'}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{sub.email}</p>
                            {sub.subject && (
                              <p className="text-xs text-gray-400 dark:text-slate-500 line-clamp-1 mt-1 italic">"{sub.subject}"</p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-200">{sub.email}</p>
                            <Badge variant={sub.subscribed ? 'success' : 'danger'}>
                              {sub.subscribed ? 'Active' : 'Unsubscribed'}
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500 dark:text-slate-400 tabular-nums">
                        {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => handleDelete(e, sub.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                          title="Remove from view"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <SubmissionModal 
        isOpen={!!selectedSubmission} 
        submission={selectedSubmission} 
        onClose={() => setSelectedSubmission(null)} 
      />
    </div>
  );
};

export default Dashboard;