const defaultSettings = {
  fontSize: 'medium',
  darkMode: false
};

export const applySavedSettings = () => {
  const savedSettings = localStorage.getItem('siteSettings');
  const settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;

  // Font size management
  const fontSizeClasses = ['text-size-small', 'text-size-medium', 'text-size-large'];
  document.documentElement.classList.remove(...fontSizeClasses);
  document.documentElement.classList.add(`text-size-${settings.fontSize}`);

  // Dark mode management
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const getCurrentSettings = () => {
  const savedSettings = localStorage.getItem('siteSettings');
  return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
};

export const saveSettings = (newSettings) => {
  localStorage.setItem('siteSettings', JSON.stringify(newSettings));
  applySavedSettings();
};