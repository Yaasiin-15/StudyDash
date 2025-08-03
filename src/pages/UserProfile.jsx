import  { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  Clock, 
  FileText, 
  Star,
  BarChart,
  Trophy,
  Flame,
  MessageSquare,
  Coffee,
  BookOpen as BookIcon,
  Monitor,
  Activity,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ChartContainer from '../components/ChartContainer';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Chart.js options
const responsive = true;
const maintainAspectRatio = false;
const beginAtZero = true;
const display = true;



const UserProfile = () => {
  const { 
    xp, 
    level, 
    tasks, 
    assignments, 
    habits, 
    grades,
    getPomodoroStats,
    resources,
    journals,
    darkMode
  } = useApp();
  
  const [tab, setTab] = useState('overview');
  
  // Calculate stats
  const completedTasks = tasks.filter(task => task.completed).length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const activeHabits = habits.filter(h => h.isGoal).length;
  const activeGoals = habits.filter(h => h.isGoal).length;
  
  // Calculate level progress
  const currentLevelXP = (level - 1) * 100;
  const nextLevelXP = level * 100;
  const xpNeeded = nextLevelXP - xp;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  
  // Calculate average grade
  let averageGrade = 0;
  if (grades.length > 0) {
    const total = grades.reduce((acc, grade) => acc + (grade.score / grade.maxScore) * 100, 0);
    averageGrade = Math.round(total / grades.length);
  }
  
  // Get pomodoro stats
  const pomodoroStats = getPomodoroStats();
  
  // Prepare focus time chart data
  const focusChartData = {
    labels: pomodoroStats.dailyStats.map(stat => stat.date.split('-')[2]),
    datasets: [
      {
        label: 'Focus Time (minutes)',
        data: pomodoroStats.dailyStats.map(stat => stat.focusTime),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
      }
    ]
  };
  
  // Prepare task completion chart data
  const taskCompletionData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [5, 3, 7, 4, 6, 2, 8], // This would be real data in a full app
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      }
    ]
  };
  
  // Prepare grade chart data
  const gradeChartData = {
    labels: grades.slice(0, 10).map(g => g.title),
    datasets: [
      {
        label: 'Grade (%)',
        data: grades.slice(0, 10).map(g => Math.round((g.score / g.maxScore) * 100)),
        backgroundColor: grades.slice(0, 10).map(g => 
          (g.score / g.maxScore) >= 0.8 
            ? 'rgba(16, 185, 129, 0.5)'
            : (g.score / g.maxScore) >= 0.6
            ? 'rgba(245, 158, 11, 0.5)'
            : 'rgba(239, 68, 68, 0.5)'
        ),
        borderColor: grades.slice(0, 10).map(g => 
          (g.score / g.maxScore) >= 0.8 
            ? 'rgb(16, 185, 129)'
            : (g.score / g.maxScore) >= 0.6
            ? 'rgb(245, 158, 11)'
            : 'rgb(239, 68, 68)'
        ),
        borderWidth: 1,
      }
    ]
  };
  
  const chartOptions = {
    responsive,
    maintainAspectRatio,
    scales: {
      y: {
        beginAtZero,
        grid: {
          display,
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
        },
      },
      x: {
        grid: {
          display,
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
        },
      },
    },
    plugins: {
      legend: {
        display,
      },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#ffffff',
        titleColor: darkMode ? '#e5e7eb' : '#1f2937',
        bodyColor: darkMode ? '#e5e7eb' : '#1f2937',
        borderColor: darkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
      },
    },
  };

  // Prepare achievements
  const achievements = [
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Complete 5 tasks before 9 AM',
      icon: <Clock size={24} />,
      unlocked: completedTasks >= 5,
      progress: Math.min(completedTasks, 5),
      maxProgress: 5,
      color: 'blue'
    },
    {
      id: 'study-marathon',
      title: 'Study Marathon',
      description: 'Complete 10 pomodoro sessions in one day',
      icon: <Flame size={24} />,
      unlocked: pomodoroStats.totalSessions >= 10,
      progress: pomodoroStats.totalSessions,
      maxProgress: 10,
      color: 'red'
    },
    {
      id: 'perfect-score',
      title: 'Perfect Score',
      description: 'Get a 100% grade on any test',
      icon: <Trophy size={24} />,
      unlocked: grades.some(g => (g.score / g.maxScore) === 1),
      date: grades.find(g => (g.score / g.maxScore) === 1)?.date,
      color: 'yellow'
    },
    {
      id: 'habit-master',
      title: 'Habit Master',
      description: 'Maintain a habit streak for 7 days',
      icon: <Star size={24} />,
      unlocked: habits.some(h => h.streak >= 7),
      progress: habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0,
      maxProgress: 7,
      color: 'green'
    },
    {
      id: 'resource-collector',
      title: 'Resource Collector',
      description: 'Add 10 different resources',
      icon: <FileText size={24} />,
      unlocked: resources.length >= 10,
      progress: resources.length,
      maxProgress: 10,
      color: 'indigo'
    },
    {
      id: 'assignment-ace',
      title: 'Assignment Ace',
      description: 'Complete 20 assignments',
      icon: <CheckSquare size={24} />,
      unlocked: completedAssignments >= 20,
      progress: completedAssignments,
      maxProgress: 20,
      color: 'purple'
    },
    {
      id: 'reflection-guru',
      title: 'Reflection Guru',
      description: 'Write 5 journal entries',
      icon: <MessageSquare size={24} />,
      unlocked: journals.length >= 5,
      progress: journals.length,
      maxProgress: 5,
      color: 'pink'
    },
    {
      id: 'night-owl',
      title: 'Night Owl',
      description: 'Complete 3 tasks after 10 PM',
      icon: <Coffee size={24} />,
      unlocked: false, // Would be based on real task completion times
      date: '2023-07-15',
      color: 'violet'
    },
    {
      id: 'bookworm',
      title: 'Bookworm',
      description: 'Add 5 books to your reading list',
      icon: <BookIcon size={24} />,
      unlocked: false,
      progress: 2, // Example value
      maxProgress: 5,
      color: 'emerald'
    },
    {
      id: 'tech-savvy',
      title: 'Tech Savvy',
      description: 'Use all features of StudyDash',
      icon: <Monitor size={24} />,
      unlocked: false,
      progress: 8, // Example value
      maxProgress: 12, // Total features
      color: 'cyan'
    },
    {
      id: 'productivity-machine',
      title: 'Productivity Machine',
      description: 'Complete 50 tasks total',
      icon: <Activity size={24} />,
      unlocked: completedTasks >= 50,
      progress: completedTasks,
      maxProgress: 50,
      color: 'amber'
    },
    {
      id: 'consistent-student',
      title: 'Consistent Student',
      description: 'Log in for 10 consecutive days',
      icon: <Bell size={24} />,
      unlocked: false,
      progress: 6, // Example value
      maxProgress: 10,
      color: 'orange'
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Profile header */}
      <div className="relative">
        {/* Cover photo */}
        <div className="h-48 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1514474959185-1472d4c4e0d4?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Cover" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        {/* Profile info */}
        <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2 px-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 border-4 border-white dark:border-gray-800 flex items-center justify-center text-white text-3xl font-bold">
              S
            </div>
            
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">Student Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your academic progress and productivity</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="mt-16 mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setTab('overview')}
            className={`pb-4 px-1 font-medium text-sm ${
              tab === 'overview'
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('stats')}
            className={`pb-4 px-1 font-medium text-sm ${
              tab === 'stats'
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Detailed Stats
          </button>
          <button
            onClick={() => setTab('achievements')}
            className={`pb-4 px-1 font-medium text-sm ${
              tab === 'achievements'
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Achievements
          </button>
        </nav>
      </div>
      
      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Level & XP */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium flex items-center">
                <Award size={20} className="text-primary-500 mr-2" />
                Current Level
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {xp} XP total
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold">Level {level}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {xpNeeded} XP to next level
              </div>
            </div>
            
            <div className="level-progress">
              <div 
                className="level-progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 mr-4">
                <CheckSquare size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</div>
                <div className="text-xl font-bold">{completedTasks}</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300 mr-4">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Assignments</div>
                <div className="text-xl font-bold">{completedAssignments}/{assignments.length}</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center">
              <div className="p-3 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300 mr-4">
                <Star size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Average Grade</div>
                <div className="text-xl font-bold">{grades.length > 0 ? `${averageGrade}%` : 'N/A'}</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center">
              <div className="p-3 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 mr-4">
                <Clock size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Focus Time</div>
                <div className="text-xl font-bold">
                  {Math.floor(pomodoroStats.totalFocusTime / 60)}h {pomodoroStats.totalFocusTime % 60}m
                </div>
              </div>
            </div>
          </div>
          
          {/* Activity Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
            <h2 className="text-lg font-medium mb-4">Activity Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Focus Time (Last 7 Days)</h3>
                <div className="h-64">
                  <Bar data={focusChartData} options={chartOptions} />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Task Completion</h3>
                <div className="h-64">
                  <Line data={taskCompletionData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Active Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Habits */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium">Active Habits</h2>
                <div className="text-sm text-primary-600 dark:text-primary-400">{activeHabits} habits</div>
              </div>
              
              {habits.filter(h => h.isGoal).length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No habits added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {habits.filter(h => h.isGoal).slice(0, 3).map(habit => (
                    <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div>
                        <div className="font-medium">{habit.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {habit.streak} day streak
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                        <span className="text-xs font-medium">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Goals */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium">Active Goals</h2>
                <div className="text-sm text-primary-600 dark:text-primary-400">{activeGoals} goals</div>
              </div>
              
              {habits.filter(h => h.isGoal).length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No goals added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {habits.filter(h => h.isGoal).slice(0, 3).map(goal => (
                    <div key={goal.id} className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{goal.title}</div>
                        <div className="text-sm">{goal.progress}%</div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-primary-600 dark:bg-primary-500 rounded-full h-2" 
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      {goal.targetDate && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Recent Journals */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium">Recent Journal Entries</h2>
                <div className="text-sm text-primary-600 dark:text-primary-400">{journals.length} entries</div>
              </div>
              
              {journals.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No journal entries yet
                </div>
              ) : (
                <div className="space-y-3">
                  {journals.slice(0, 3).map(journal => (
                    <div key={journal.id} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium">{journal.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(journal.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {journal.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Detailed Stats tab */}
      {tab === 'stats' && (
        <div className="space-y-6">
          {/* Study Time & Grades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Study Time Distribution">
              <div className="h-80">
                <Bar
                  data={focusChartData}
                  options={chartOptions}
                />
              </div>
            </ChartContainer>
            
            <ChartContainer title="Recent Grades">
              {grades.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No grades recorded yet
                </div>
              ) : (
                <div className="h-80">
                  <Bar
                    data={gradeChartData}
                    options={{
                      ...chartOptions,
                      indexAxis: 'y',
                    }}
                  />
                </div>
              )}
            </ChartContainer>
          </div>
          
          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <div className="flex items-center mb-4">
                <Calendar size={20} className="text-primary-500 mr-2" />
                <h3 className="text-base font-medium">Productivity</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Total Focus Sessions</span>
                    <span className="font-medium">{pomodoroStats.totalSessions}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 rounded-full h-2"
                      style={{ width: `${Math.min(100, pomodoroStats.totalSessions * 5)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Tasks Completed</span>
                    <span className="font-medium">{completedTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 rounded-full h-2"
                      style={{ width: `${Math.min(100, (completedTasks / Math.max(1, tasks.length)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Assignments Completed</span>
                    <span className="font-medium">{completedAssignments}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2"
                      style={{ width: `${Math.min(100, (completedAssignments / Math.max(1, assignments.length)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <div className="flex items-center mb-4">
                <FileText size={20} className="text-primary-500 mr-2" />
                <h3 className="text-base font-medium">Resource Utilization</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Resources Added</span>
                    <span className="font-medium">{resources.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 rounded-full h-2"
                      style={{ width: `${Math.min(100, resources.length * 10)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">PDF Resources</span>
                    <span className="font-medium">{resources.filter(r => r.isPdf).length}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-500 rounded-full h-2"
                      style={{ width: `${Math.min(100, (resources.filter(r => r.isPdf).length / Math.max(1, resources.length)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Linked Resources</span>
                    <span className="font-medium">
                      {resources.filter(r => r.linkedAssignments && r.linkedAssignments.length > 0).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 rounded-full h-2"
                      style={{ width: `${Math.min(100, (resources.filter(r => r.linkedAssignments && r.linkedAssignments.length > 0).length / Math.max(1, resources.length)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <div className="flex items-center mb-4">
                <BarChart size={20} className="text-primary-500 mr-2" />
                <h3 className="text-base font-medium">Academic Performance</h3>
              </div>
              
              {grades.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No grades recorded yet
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Average Grade</span>
                      <span className="font-medium">{averageGrade}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`rounded-full h-2 ${
                          averageGrade >= 80 
                            ? 'bg-green-500' 
                            : averageGrade >= 60 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${averageGrade}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Highest Grade</span>
                      <span className="font-medium">
                        {Math.round(Math.max(...grades.map(g => (g.score / g.maxScore) * 100)))}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Lowest Grade</span>
                      <span className="font-medium">
                        {Math.round(Math.min(...grades.map(g => (g.score / g.maxScore) * 100)))}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Grade Distribution</span>
                    </div>
                    <div className="flex justify-between h-8">
                      {/* A simple visualization of grade distribution */}
                      <div 
                        className="bg-green-500 rounded-l-sm" 
                        style={{ 
                          width: `${(grades.filter(g => (g.score / g.maxScore) >= 0.8).length / grades.length) * 100}%` 
                        }}
                      ></div>
                      <div 
                        className="bg-yellow-500" 
                        style={{ 
                          width: `${(grades.filter(g => (g.score / g.maxScore) >= 0.6 && (g.score / g.maxScore) < 0.8).length / grades.length) * 100}%` 
                        }}
                      ></div>
                      <div 
                        className="bg-red-500 rounded-r-sm" 
                        style={{ 
                          width: `${(grades.filter(g => (g.score / g.maxScore) < 0.6).length / grades.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>A (80%+)</span>
                      <span>B-C (60-79%)</span>
                      <span>D-F (0-59%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Achievements tab */}
      {tab === 'achievements' && (
        <div className="space-y-6">
          {/* Achievement stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Trophy size={20} className="text-primary-500 mr-2" />
              Your Achievements
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg p-4">
                <div className="text-4xl font-bold mb-1">{unlockedAchievements.length}</div>
                <div className="text-sm opacity-90">Achievements Earned</div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-lg p-4">
                <div className="text-4xl font-bold mb-1">{achievements.length - unlockedAchievements.length}</div>
                <div className="text-sm opacity-90">Achievements Remaining</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-lg p-4">
                <div className="text-4xl font-bold mb-1">{Math.round((unlockedAchievements.length / achievements.length) * 100)}%</div>
                <div className="text-sm opacity-90">Completion Rate</div>
              </div>
            </div>
          </div>
          
          {/* Unlocked achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">Unlocked Achievements</h3>
            </div>
            
            {unlockedAchievements.length === 0 ? (
              <div className="p-5 text-center text-gray-500 dark:text-gray-400">
                You haven't unlocked any achievements yet. Keep using StudyDash to earn badges
              </div>
            ) : (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`bg-${achievement.color}-100 dark:bg-${achievement.color}-900/30 p-4`}>
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-full bg-${achievement.color}-500/20`}>
                          <div className={`text-${achievement.color}-600 dark:text-${achievement.color}-400`}>
                            {achievement.icon}
                          </div>
                        </div>
                        <div className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-full px-2 py-0.5 text-xs font-medium">
                          Unlocked
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-medium mb-1">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {achievement.description}
                      </p>
                      
                      {achievement.date && (
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Earned on {new Date(achievement.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Locked achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">Locked Achievements</h3>
            </div>
            
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm opacity-75 dark:opacity-60"
                >
                  <div className="bg-gray-100 dark:bg-gray-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div className="text-gray-500 dark:text-gray-400">
                          {achievement.icon}
                        </div>
                      </div>
                      <div className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full px-2 py-0.5 text-xs font-medium">
                        Locked
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                    
                    {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <div 
                            className="bg-gray-400 dark:bg-gray-500 rounded-full h-1.5" 
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
 