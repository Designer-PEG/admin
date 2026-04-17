import { useState, useEffect } from 'react';
import { getCurrentSettings, saveSettings } from '../components/applySettings';
import Button from '../components/ui/Button';
import useDataFetch from '../hooks/useDataFetch';
import { FiRefreshCw, FiTrash2 } from 'react-icons/fi';

const Settings = () => {
  const { clearDeletions } = useDataFetch();
  const [settings, setSettings] = useState({ 
    fontSize: 'medium', 
    darkMode: false,
    notifications: true,
    autoRefresh: true
  });
  const [saved, setSaved] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const current = getCurrentSettings();
    setSettings(prev => ({ ...prev, ...current }));
  }, []);

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleRestore = () => {
    if (window.confirm('Are you sure you want to restore all deleted submissions? This will make them visible again in your dashboard.')) {
      clearDeletions();
      setRestored(true);
      setTimeout(() => setRestored(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your application preferences and account security</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800 transition-all shadow-sm">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100 dark:divide-slate-800">
          {/* Appearance Section */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Appearance</h3>
            
            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Interface Font Size</label>
                <select
                  name="fontSize"
                  value={settings.fontSize}
                  onChange={handleChange}
                  className="w-full sm:w-64 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="small">Small (Compact)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="large">Large (Comfortable)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2 dark:text-gray-500">Affects the legibility of dashboard text and tables.</p>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="max-w-[80%]">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">Dark Mode</label>
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Optimize the interface for low-light environments.</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('darkMode')}
                  className={`${settings.darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
                >
                  <span className={`${settings.darkMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`} />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Notifications & Alerts</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">Email for New Submissions</label>
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Receive an instant email when a new contact or subscription occurs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('notifications')}
                  className={`${settings.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
                >
                  <span className={`${settings.notifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">Real-time Data Update</label>
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Automatically refresh stats and submissions every 5 minutes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('autoRefresh')}
                  className={`${settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
                >
                  <span className={`${settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`} />
                </button>
              </div>
            </div>
          </div>

          {/* Data Management Section */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 text-red-600 dark:text-red-500">Data Management</h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">Restore Local Data</label>
                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Clear your local deletion history and restore all hidden submissions.</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleRestore}
                >
                  <FiRefreshCw className="mr-2 h-4 w-4" />
                  Restore Submissions
                </Button>
                {restored && (
                  <span className="text-xs text-green-600 font-medium animate-in slide-in-from-right-2 duration-300">✓ All submissions restored</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer / Save */}
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {saved && (
                <span className="text-sm text-green-600 font-medium animate-in fade-in duration-300">✓ Settings saved successfully</span>
              )}
            </div>
            <Button type="submit" variant="primary" size="md">
              Update Preferences
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;