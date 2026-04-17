import { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeData, fetchFreshData } from '../utils/dataService';
import { getDeletedIds, markAsDeleted, clearAllDeletions } from '../utils/localPersistence';

/**
 * Custom hook for fetching and managing submission data with local deletion support.
 */
const useDataFetch = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [deletedIds, setDeletedIds] = useState([]);

  // Load deleted IDs on mount
  useEffect(() => {
    setDeletedIds(getDeletedIds());
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await initializeData();

      setRawData(result.data || []);
      setError(result.error);
      setLastUpdated(result.timestamp);
      setIsUsingCache(!!result.isCached);

      if (result.isCached) {
        const freshResult = await fetchFreshData();
        if (freshResult.data && !freshResult.error) {
          setRawData(freshResult.data);
          setLastUpdated(freshResult.timestamp);
          setIsUsingCache(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFreshData();
      setRawData(result.data || []);
      setError(result.error);
      setLastUpdated(result.timestamp);
      setIsUsingCache(false);
    } catch (err) {
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Action: Local Delete
  const deleteItem = useCallback((id) => {
    const updated = markAsDeleted(id);
    setDeletedIds(updated);
  }, []);

  // Action: Clear all deletions
  const clearDeletions = useCallback(() => {
    clearAllDeletions();
    setDeletedIds([]);
  }, []);

  // Derived filtered data
  const data = useMemo(() => {
    return rawData.filter(item => !deletedIds.includes(item.id));
  }, [rawData, deletedIds]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { 
    data, 
    loading, 
    error, 
    lastUpdated, 
    isUsingCache, 
    refresh, 
    deleteItem, 
    clearDeletions 
  };
};

export default useDataFetch;
