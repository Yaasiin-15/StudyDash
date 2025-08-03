import   { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  ChevronLeft, 
  ClipboardList, 
  Clock,
  FileText, 
  Heart, 
  Home, 
  LifeBuoy, 
  List, 
  Menu, 
  Layers,
  Star, 
  User,
  Sliders,
  Sun,
  Moon,
  BookOpen as BookIcon,
  Trophy,
  FileText as JournalIcon,
  Database,
  Package,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';



const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { xp, level, darkMode, toggleDarkMode } = useApp();
  const { user, logout } = useAuth();
  const [levelProgress, setLevelProgress] = useState(0);

  useEffect(() => {
    // Calculate level progress
    const currentLevelXP = (level - 1) * 100;
    const nextLevelXP = level * 100;
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    setLevelProgress(progress);
  }, [xp, level]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/study-manager', label: 'Study Manager', icon: <BookOpen size={20} /> },
    { path: '/todolist', label: 'To-Do List', icon: <ClipboardList size={20} /> },
    { path: '/calendar', label: 'Calendar', icon: <Calendar size={20} /> },
    { path: '/habitsgoals', label: 'Habits & Goals', icon: <Star size={20} /> },
    { path: '/pomodoro', label: 'Pomodoro Timer', icon: <Clock size={20} /> },
    { path: '/resources', label: 'Resources', icon: <FileText size={20} /> },
    { path: '/grades', label: 'Grades', icon: <Trophy size={20} /> },
    { path: '/wishlist', label: 'Wishlist', icon: <Heart size={20} /> },
    { path: '/reading', label: 'Reading List', icon: <BookIcon size={20} /> },
    { path: '/journal', label: 'Journal', icon: <JournalIcon size={20} /> },
    { path: '/analytics', label: 'Subject Analytics', icon: <Database size={20} /> },
    { path: '/recommendations', label: 'Recommendations', icon: <LifeBuoy size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:z-0 flex flex-col`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-2 mr-2">
                <Layers size={20} className="text-white" />
              </div>
              <h1 className="font-bold text-xl text-gray-800 dark:text-white">StudyDash</h1>
            </div>
            <button 
              onClick={toggleSidebar}
              className="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 lg:hidden"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          
          {/* Level & XP */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Package size={16} className="text-primary-600 dark:text-primary-400 mr-1" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Level {level}</span>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{xp} XP</span>
            </div>
            <div className="level-progress">
              <div 
                className="level-progress-bar" 
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* User info and controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-auto">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-2">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Link
              to="/settings"
              className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <Sliders size={18} className="mr-2" />
              Settings
            </Link>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 right-4 z-30 lg:hidden bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
      >
        <Menu size={24} />
      </button>
    </>
  );
};

export default Sidebar;
 