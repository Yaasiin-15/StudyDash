import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to generate user-specific storage keys
const getUserStorageKey = (userId, key) => `user_${userId}_${key}`;

// Helper function to get all user data
const getUserData = (userId) => {
  const userData = {};
  const keys = [
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
  
  keys.forEach(key => {
    const stored = localStorage.getItem(getUserStorageKey(userId, key));
    if (stored) {
      try {
        userData[key] = JSON.parse(stored);
      } catch (error) {
        console.error(`Error parsing ${key} data:`, error);
      }
    }
  });
  
  return userData;
};

// Helper function to save user data
const saveUserData = (userId, key, data) => {
  localStorage.setItem(getUserStorageKey(userId, key), JSON.stringify(data));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.isAuthenticated) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // In a real app, you would make an API call here
      // For now, we'll simulate a successful login
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userData = {
        id: userId,
        email,
        displayName: email.split('@')[0], // Use email prefix as display name
        isAuthenticated: true,
        createdAt: new Date().toISOString()
      };
      
      // Store current user
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Initialize user-specific data if it doesn't exist
      const existingData = getUserData(userId);
      if (!existingData.settings) {
        saveUserData(userId, 'settings', {
          displayName: userData.displayName,
          email: userData.email,
          bio: '',
          notifications: {
            email: true,
            push: false,
            reminders: true,
            updates: false
          }
        });
      }
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (email, password, displayName) => {
    try {
      // In a real app, you would make an API call here
      // For now, we'll simulate a successful registration
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userData = {
        id: userId,
        email,
        displayName,
        isAuthenticated: true,
        createdAt: new Date().toISOString()
      };
      
      // Store current user
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Initialize user-specific data
      saveUserData(userId, 'settings', {
        displayName: displayName,
        email: email,
        bio: '',
        notifications: {
          email: true,
          push: false,
          reminders: true,
          updates: false
        }
      });
      
      // Initialize other user data
      saveUserData(userId, 'todos', []);
      saveUserData(userId, 'assignments', []);
      saveUserData(userId, 'habits', []);
      saveUserData(userId, 'goals', []);
      saveUserData(userId, 'grades', []);
      saveUserData(userId, 'journal', []);
      saveUserData(userId, 'wishlist', []);
      saveUserData(userId, 'reading', []);
      saveUserData(userId, 'finance', []);
      saveUserData(userId, 'analytics', {});
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    // Clear all user-specific data
    if (user?.id) {
      const keys = [
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
        'analytics',
        'xp',
        'level',
        'tasks',
        'resources',
        'reading_list',
        'journals',
        'tests',
        'pomodoro_sessions',
        'time_slots',
        'dark_mode'
      ];
      
      keys.forEach(key => {
        localStorage.removeItem(getUserStorageKey(user.id, key));
      });
    }
    
    localStorage.removeItem('currentUser');
    setUser(null);
    navigate('/login');
  };

  const updateUserData = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  // User-specific data management functions
  const getUserDataByKey = (key) => {
    if (!user?.id) return null;
    const stored = localStorage.getItem(getUserStorageKey(user.id, key));
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error(`Error parsing ${key} data:`, error);
        return null;
      }
    }
    return null;
  };

  const saveUserDataByKey = (key, data) => {
    if (!user?.id) return false;
    try {
      saveUserData(user.id, key, data);
      return true;
    } catch (error) {
      console.error(`Error saving ${key} data:`, error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserData,
    isAuthenticated: !!user?.isAuthenticated,
    getUserDataByKey,
    saveUserDataByKey
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 