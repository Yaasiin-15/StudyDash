// User Data Management Utility
// This utility helps manage user-specific data across the application

export const getUserStorageKey = (userId, key) => `user_${userId}_${key}`;

export const getUserData = (userId, key) => {
  if (!userId) return null;
  
  const storageKey = getUserStorageKey(userId, key);
  const stored = localStorage.getItem(storageKey);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error(`Error parsing ${key} data for user ${userId}:`, error);
      return null;
    }
  }
  
  return null;
};

export const saveUserData = (userId, key, data) => {
  if (!userId) return false;
  
  try {
    const storageKey = getUserStorageKey(userId, key);
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} data for user ${userId}:`, error);
    return false;
  }
};

export const deleteUserData = (userId, key) => {
  if (!userId) return false;
  
  try {
    const storageKey = getUserStorageKey(userId, key);
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error(`Error deleting ${key} data for user ${userId}:`, error);
    return false;
  }
};

export const getAllUserData = (userId) => {
  if (!userId) return {};
  
  const dataTypes = [
    'settings',
    'todos',
    'assignments',
    'habits',
    'goals',
    'grades',
    'journal',
    'wishlist',
    'reading',
    'finance',
    'analytics'
  ];
  
  const userData = {};
  
  dataTypes.forEach(key => {
    const data = getUserData(userId, key);
    if (data !== null) {
      userData[key] = data;
    }
  });
  
  return userData;
};

export const clearAllUserData = (userId) => {
  if (!userId) return false;
  
  try {
    const dataTypes = [
      'settings',
      'todos',
      'assignments',
      'habits',
      'goals',
      'grades',
      'journal',
      'wishlist',
      'reading',
      'finance',
      'analytics'
    ];
    
    dataTypes.forEach(key => {
      deleteUserData(userId, key);
    });
    
    return true;
  } catch (error) {
    console.error(`Error clearing all data for user ${userId}:`, error);
    return false;
  }
};

// Hook for components to easily access user data
export const useUserData = (authContext) => {
  const { user, getUserDataByKey, saveUserDataByKey } = authContext;
  
  const getUserData = (key) => {
    return getUserDataByKey(key);
  };
  
  const saveUserData = (key, data) => {
    return saveUserDataByKey(key, data);
  };
  
  const updateUserData = (key, updater) => {
    const currentData = getUserDataByKey(key);
    const newData = typeof updater === 'function' ? updater(currentData) : updater;
    return saveUserDataByKey(key, newData);
  };
  
  return {
    user,
    getUserData,
    saveUserData,
    updateUserData
  };
}; 