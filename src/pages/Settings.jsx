import { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Download, 
  Trash2,
  Save,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getAllUserData } from '../utils/userDataManager';

const Settings = () => {
  const { darkMode, toggleDarkMode } = useApp();
  const { user, getUserDataByKey, saveUserDataByKey, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminders: true,
    updates: false
  });
  const [userData, setUserData] = useState({
    displayName: '',
    email: '',
    bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'account', label: 'Account', icon: <User size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={20} /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield size={20} /> },
    { id: 'data', label: 'Data & Storage', icon: <Download size={20} /> }
  ];

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      const settings = getUserDataByKey('settings');
      if (settings) {
        setUserData({
          displayName: settings.displayName || '',
          email: settings.email || '',
          bio: settings.bio || ''
        });
        setNotifications(settings.notifications || {
          email: true,
          push: false,
          reminders: true,
          updates: false
        });
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user, getUserDataByKey]);

  const handleUserDataChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const settingsData = {
        ...userData,
        notifications
      };
      
      const success = saveUserDataByKey('settings', settingsData);
      if (success) {
        // Show success message (you could add a toast notification here)
        console.log('Settings saved successfully');
      } else {
        console.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    if (!user?.id) return;
    
    try {
      const userData = getAllUserData(user.id);
      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt
        },
        data: userData,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studydash-data-${user.email}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleDeleteAccount = () => {
    if (!user?.id) return;
    
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
      try {
        // Clear all user data
        const dataTypes = [
          'settings', 'todos', 'assignments', 'habits', 'goals',
          'grades', 'journal', 'wishlist', 'reading', 'finance', 'analytics'
        ];
        
        dataTypes.forEach(key => {
          const storageKey = `user_${user.id}_${key}`;
          localStorage.removeItem(storageKey);
        });
        
        // Logout user
        logout();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={userData.displayName}
                      onChange={(e) => handleUserDataChange('displayName', e.target.value)}
                      placeholder="Enter your display name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => handleUserDataChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      value={userData.bio}
                      onChange={(e) => handleUserDataChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {key} Notifications
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive {key} notifications about your activities
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Theme Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Dark Mode
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Switch between light and dark themes
                      </p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Privacy & Security
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Data Privacy
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Your data is encrypted and stored securely. We never share your personal information with third parties.
                    </p>
                    <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      View Privacy Policy
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Account Security
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Keep your account secure with strong passwords and two-factor authentication.
                    </p>
                    <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Data & Storage
                </h3>
                <div className="space-y-4">
                                     <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                     <div>
                       <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                         Export Data
                       </h4>
                       <p className="text-sm text-gray-600 dark:text-gray-400">
                         Download all your data in JSON format
                       </p>
                     </div>
                     <button 
                       onClick={handleExportData}
                       className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
                     >
                       <Download size={16} className="mr-1" />
                       Export
                     </button>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                     <div>
                       <h4 className="text-sm font-medium text-red-900 dark:text-red-400">
                         Delete Account
                       </h4>
                       <p className="text-sm text-red-600 dark:text-red-300">
                         Permanently delete your account and all data
                       </p>
                     </div>
                     <button 
                       onClick={handleDeleteAccount}
                       className="flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-700"
                     >
                       <Trash2 size={16} className="mr-1" />
                       Delete
                     </button>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} className="mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings; 