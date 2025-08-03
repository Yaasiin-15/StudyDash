import  { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LevelUpModal from './components/LevelUpModal';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudyManager from './pages/StudyManager';
import TodoList from './pages/TodoList';
import Calendar from './pages/Calendar';
import HabitsGoals from './pages/HabitsGoals';
import Resources from './pages/Resources';
import Grades from './pages/Grades';
import Wishlist from './pages/Wishlist';
import ReadingList from './pages/ReadingList';
import Journal from './pages/Journal';
import SubjectAnalytics from './pages/SubjectAnalytics';
import Recommendations from './pages/Recommendations';
import UserProfile from './pages/UserProfile';
import PomodoroTimer from './pages/PomodoroTimer';
import Assignments from './pages/Assignments';
import FinanceTracker from './pages/FinanceTracker';
import Goals from './pages/Goals';
import Habits from './pages/Habits';
import StudyAssignments from './pages/StudyAssignments';
import Settings from './pages/Settings';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { level, showLevelUpModal, setShowLevelUpModal } = useApp();
  const { isAuthenticated } = useAuth();

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeLevelUpModal = () => {
    setShowLevelUpModal(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {isAuthenticated && <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}
      
      <main className={`flex-1 overflow-y-auto ${isAuthenticated ? 'pl-0 lg:pl-64' : ''}`}>
        <div className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/study-manager" element={
              <ProtectedRoute>
                <StudyManager />
              </ProtectedRoute>
            } />
            <Route path="/todolist" element={
              <ProtectedRoute>
                <TodoList />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } />
            <Route path="/habitsgoals" element={
              <ProtectedRoute>
                <HabitsGoals />
              </ProtectedRoute>
            } />
            <Route path="/pomodoro" element={
              <ProtectedRoute>
                <PomodoroTimer />
              </ProtectedRoute>
            } />
            <Route path="/resources" element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            } />
            <Route path="/grades" element={
              <ProtectedRoute>
                <Grades />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } />
            <Route path="/reading" element={
              <ProtectedRoute>
                <ReadingList />
              </ProtectedRoute>
            } />
            <Route path="/journal" element={
              <ProtectedRoute>
                <Journal />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <SubjectAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/recommendations" element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/assignments" element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            } />
            <Route path="/finance" element={
              <ProtectedRoute>
                <FinanceTracker />
              </ProtectedRoute>
            } />
            <Route path="/goals" element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            } />
            <Route path="/habits" element={
              <ProtectedRoute>
                <Habits />
              </ProtectedRoute>
            } />
            <Route path="/study-assignments" element={
              <ProtectedRoute>
                <StudyAssignments />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </main>

      {isAuthenticated && (
        <LevelUpModal 
          level={level} 
          isOpen={showLevelUpModal} 
          onClose={closeLevelUpModal} 
        />
      )}
    </div>
  );
}

export default App;
 