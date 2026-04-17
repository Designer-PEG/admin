// utils/localPersistence.js

const DELETED_IDS_KEY = 'deleted_submission_ids';

/**
 * Gets the list of locally deleted submission IDs.
 */
export const getDeletedIds = () => {
  try {
    const stored = localStorage.getItem(DELETED_IDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error reading deleted IDs from localStorage:', e);
    return [];
  }
};

/**
 * Marks a submission as deleted by adding its ID to the local list.
 */
export const markAsDeleted = (id) => {
  try {
    const deletedIds = getDeletedIds();
    if (!deletedIds.includes(id)) {
      const updated = [...deletedIds, id];
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(updated));
      return updated;
    }
    return deletedIds;
  } catch (e) {
    console.error('Error saving deleted ID to localStorage:', e);
    return getDeletedIds();
  }
};

/**
 * Checks if a specific ID is marked as deleted.
 */
export const isDeleted = (id) => {
  return getDeletedIds().includes(id);
};

/**
 * Wipes the entire deletion history, restoring all items to view.
 */
export const clearAllDeletions = () => {
  try {
    localStorage.removeItem(DELETED_IDS_KEY);
    return true;
  } catch (e) {
    console.error('Error clearing deletion history:', e);
    return false;
  }
};
