import  { useNavigate } from 'react-router-dom';
import { 
  Award, 
  CheckSquare, 
  Star, 
  BookOpen,
  Calendar,
  Clock,
  FileText,
  List
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartContainer from '../components/ChartContainer';
import XPChart from '../components/charts/XPChart';
import AssignmentChart from '../components/charts/AssignmentChart';
import { useApp } from '../context/AppContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    xp, 
    level, 
    tasks, 
    assignments, 
    habits, 
    grades,
    getPomodoroStats
  } = useApp();
  
  // Calculate stats
  const completedTasks = tasks.filter(task => task.completed).length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const activeGoals = habits.filter(h => h.isGoal && h.progress < 100).length;
  
  // Calculate average grade
  let averageGrade = 0;
  if (grades.length > 0) {
    const total = grades.reduce((acc, grade) => acc + (grade.score / grade.maxScore) * 100, 0);
    averageGrade = Math.round(total / grades.length);
  }
  
  // Get pomodoro stats
  const pomodoroStats = getPomodoroStats();
  
  // Quick access items
  const quickAccessItems = [
    {
      title: 'Calendar',
      description: 'View & manage your schedule',
      icon: <Calendar size={20} className="text-indigo-500" />,
      path: '/calendar'
    },
    {
      title: 'Study Manager',
      description: 'Track assignments & study tasks',
      icon: <BookOpen size={20} className="text-purple-500" />,
      path: '/study-manager'
    },
    {
      title: 'To-Do List',
      description: 'Manage your daily tasks',
      icon: <List size={20} className="text-green-500" />,
      path: '/todolist'
    },
    {
      title: 'Pomodoro Timer',
      description: 'Focus sessions & breaks',
      icon: <Clock size={20} className="text-red-500" />,
      path: '/pomodoro'
    },
    {
      title: 'Resources',
      description: 'Access study materials',
      icon: <FileText size={20} className="text-blue-500" />,
      path: '/resources'
    }
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome header with hero image */}
      <div className="relative rounded-xl overflow-hidden mb-6">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1514474959185-1472d4c4e0d4?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Students collaborating" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-800/60"></div>
        </div>
        
        <div className="relative p-6 lg:p-8 flex flex-col md:flex-row justify-between md:items-center h-64">
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome to StudyDash</h1>
            <p className="text-white/90 max-w-lg">
              Track your progress, manage assignments, and boost productivity with our comprehensive student dashboard
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white">
            <Award size={20} className="mr-2" />
            <div>
              <div className="text-sm font-medium">Level {level}</div>
              <div className="text-xs">{xp} XP</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total XP" 
          value={xp} 
          icon={<Award size={24} />} 
          color="primary"
          change={12}
        />
        <StatCard 
          title="Tasks Completed" 
          value={completedTasks} 
          icon={<CheckSquare size={24} />} 
          color="success"
          change={5}
        />
        <StatCard 
          title="Average Grade" 
          value={grades.length > 0 ? `${averageGrade}%` : 'N/A'} 
          icon={<Star size={24} />} 
          color="warning"
          change={grades.length > 0 ? 3 : undefined}
        />
        <StatCard 
          title="Active Goals" 
          value={activeGoals} 
          icon={<BookOpen size={24} />} 
          color="danger"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartContainer title="XP Growth">
          <XPChart />
        </ChartContainer>
        <ChartContainer title="Assignment Status">
          <AssignmentChart />
        </ChartContainer>
      </div>
      
      {/* Focus time & recent grades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Focus time */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium">Focus Time</h3>
            <button 
              onClick={() => navigate('/pomodoro')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Start session
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold">
              {Math.floor(pomodoroStats.totalFocusTime / 60)}h {pomodoroStats.totalFocusTime % 60}m
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {pomodoroStats.totalSessions} sessions
            </div>
          </div>
          
          {/* Weekly focus overview */}
          <div className="grid grid-cols-7 gap-1 mt-4">
            {pomodoroStats.dailyStats.map((day, index) => {
              const height = day.focusTime > 0 
                ? Math.max(20, Math.min(80, (day.focusTime / 60) * 40)) 
                : 4;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-full bg-primary-100 dark:bg-primary-900/30 rounded-t-sm" 
                    style={{ height: `${height}px` }}
                  ></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {day.date.split('-')[2]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Recent grades */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium">Recent Grades</h3>
            <button 
              onClick={() => navigate('/grades')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View all
            </button>
          </div>
          
          {grades.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              No grades recorded yet
            </div>
          ) : (
            <div className="space-y-3">
              {grades.slice(0, 3).map(grade => (
                <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div>
                    <div className="font-medium">{grade.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{grade.course}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {grade.score}/{grade.maxScore}
                    </div>
                    <div className={`text-sm ${
                      (grade.score / grade.maxScore) >= 0.8 
                        ? 'text-success-500' 
                        : (grade.score / grade.maxScore) >= 0.6 
                        ? 'text-warning-500' 
                        : 'text-danger-500'
                    }`}>
                      {Math.round((grade.score / grade.maxScore) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Quick access */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
        <h3 className="text-base font-medium mb-4">Quick Access</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickAccessItems.map((item, index) => (
            <button 
              key={index}
              onClick={() => navigate(item.path)}
              className="w-full text-left p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg flex flex-col border border-gray-200 dark:border-gray-600 hover-scale shadow-sm"
            >
              <div className="mb-2">{item.icon}</div>
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
 