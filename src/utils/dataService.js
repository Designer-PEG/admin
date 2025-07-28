// utils/dataService.js
import { fetchAllData } from './api';
import { dataSources, CACHE_KEY, CACHE_EXPIRY_MINUTES } from './constants'

const transformData = (data) => {
  return data.map((item, index) => ({
    id: `${index + 1}`,
    sourceSite: item._source,
    sourceUrl: dataSources.find(src => src.name === item._source)?.url || '',
    type: item._source.includes('Subscription') || item._source.includes('Consultation') 
      ? 'subscription' 
      : 'contact',
    submittedAt: item.timestamp || new Date().toISOString(),
    name: item.name || 'Not provided',
    email: item.email || 'No email',
    subject: item.subject || item.company || 'No subject',
    message: item.message || 'No message provided',
    subscribed: true
  }));
};

// Get cached data if valid
const getCachedData = () => {
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (!cachedData) return null;
  
  const { data, timestamp } = JSON.parse(cachedData);
  const cacheAgeMinutes = (new Date().getTime() - timestamp) / (1000 * 60);
  
  return cacheAgeMinutes < CACHE_EXPIRY_MINUTES ? { data, timestamp } : null;
};

// Fetch fresh data from all sources
const fetchFreshData = async () => {
  try {
    const freshData = await fetchAllData();
    const transformedData = transformData(freshData);
    
    // Update cache
    const cacheData = {
      data: transformedData,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    
    return {
      data: transformedData,
      error: null,
      timestamp: new Date()
    };
  } catch (err) {
    // If fetch fails but we have cached data, use that
    const cached = getCachedData();
    if (cached) {
      return {
        data: cached.data,
        error: 'Failed to fetch fresh data. Showing cached data.',
        timestamp: new Date(cached.timestamp)
      };
    }
    return {
      data: [],
      error: err.message,
      timestamp: new Date()
    };
  }
};

// Initialize data - to be called after login
const initializeData = async () => {
  const cached = getCachedData();
  if (cached) {
    // Return cached data but refresh in background
    setTimeout(fetchFreshData, 0);
    return {
      data: cached.data,
      error: null,
      timestamp: new Date(cached.timestamp)
    };
  }
  return await fetchFreshData();
};

export { initializeData, fetchFreshData, getCachedData };