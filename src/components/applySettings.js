const defaultSettings = {
  fontSize: 'medium',
  darkMode: false
};

export const applySavedSettings = () => {
  const savedSettings = localStorage.getItem('siteSettings');
  const settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;

  // Apply font size
  document.documentElement.className = `text-size-${settings.fontSize}`;

  // Apply dark mode
  document.documentElement.classList.toggle('dark', settings.darkMode);
};

export const getCurrentSettings = () => {
  const savedSettings = localStorage.getItem('siteSettings');
  return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
};

export const saveSettings = (newSettings) => {
  localStorage.setItem('siteSettings', JSON.stringify(newSettings));
  applySavedSettings();
};