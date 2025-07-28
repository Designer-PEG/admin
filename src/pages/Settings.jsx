import { useState, useEffect } from 'react';
import { getCurrentSettings, saveSettings } from '../components/applySettings';

const Settings = () => {
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    darkMode: false
  });

  // Load current settings
  useEffect(() => {
    const current = getCurrentSettings();
    setSettings(current);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings(settings);
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Application Settings
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Font Size Setting */}
        <div className="px-6 py-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Font Size
          </label>
          <select
            name="fontSize"
            value={settings.fontSize}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="small">Small (Compact)</option>
            <option value="medium">Medium (Default)</option>
            <option value="large">Large (Accessible)</option>
          </select>
        </div>

        {/* Dark Mode Toggle */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dark Mode
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Switch between light and dark themes
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              className={`${
                settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-right">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;