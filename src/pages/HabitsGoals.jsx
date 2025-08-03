import   { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash, Activity, Check, Award, Flag, ChevronRight, ChevronLeft, Calendar, Star, CheckSquare } from 'lucide-react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDate, getDay, addMonths, subMonths } from 'date-fns';

const HabitsGoals = () => {
  const { habits, addHabit, toggleHabitCompletion, deleteHabit, updateHabitProgress } = useApp();
  const [tabView, setTabView] = useState('habits');
  const [habitView, setHabitView] = useState('week');
  const [newHabit, setNewHabit] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [habitFilter, setHabitFilter] = useState('all');
  const [goalFilter, setGoalFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showTooltip, setShowTooltip] = useState(null);

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (newHabit.trim()) {
      addHabit({
        title: newHabit.trim(),
      });
      setNewHabit('');
    }
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (newGoal.trim() && targetDate) {
      addHabit({
        title: newGoal.trim(),
        targetDate,
        isGoal: true
      });
      setNewGoal('');
      setTargetDate('');
    }
  };

  // Get days of current week for habit tracker
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => {
    const day = addDays(startOfCurrentWeek, i);
    return {
      date: day,
      dayName: format(day, 'EEE'),
      dayNumber: format(day, 'd'),
      dateString: format(day, 'yyyy-MM-dd'),
      isToday: format(today, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'),
    };
  });

  // Get days for the selected month
  const startDay = startOfMonth(selectedMonth);
  const endDay = endOfMonth(selectedMonth);
  const monthDays = eachDayOfInterval({ start: startDay, end: endDay });

  // Calculate days matrix for calendar view
  const generateCalendarDays = () => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start: start, end: end });
    
    // Fill in leading days from previous month
    const firstDayOfMonth = getDay(start);
    const leadingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start
    
    // Create 6-row calendar (max possible weeks in a month)
    let calendarDays = [];
    let week = [];
    
    // Add leading empty cells
    for (let i = 0; i < leadingDays; i++) {
      week.push(null);
    }
    
    // Add actual days
    days.forEach(day => {
      week.push(day);
      if (week.length === 7) {
        calendarDays.push(week);
        week = [];
      }
    });
    
    // Add trailing empty cells if needed
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      calendarDays.push(week);
    }
    
    return calendarDays;
  };

  // Filter habits and goals based on selected filter
  const habitItems = habits
    .filter(habit => habit.isGoal)
    .filter(habit => {
      if (habitFilter === 'all') return true;
      if (habitFilter === 'active') return habit.streak > 0;
      if (habitFilter === 'inactive') return habit.streak === 0;
      return true;
    });

  const goalItems = habits
    .filter(habit => habit.isGoal)
    .filter(goal => {
      if (goalFilter === 'all') return true;
      if (goalFilter === 'active') return goal.progress < 100;
      if (goalFilter === 'completed') return goal.progress === 100;
      return true;
    });

  // Check if a habit was completed on a specific date
  const wasHabitCompletedOnDate = (habitId, dateString) => {
    const habit = habits.find(h => h.id === habitId);
    return habit?.completedDates.includes(dateString) || false;
  };

  const prevMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
  };

  const nextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };

  const getConsecutiveCompletionCount = (habit, dateString) => {
    // Get all dates this habit was completed
    const completedDates = habit.completedDates.sort();
    if (completedDates.length === 0) return 0;
    
    // Check if the requested date is in the completed dates
    if (completedDates.includes(dateString)) return 0;
    
    // Find index of the date
    const dateIndex = completedDates.indexOf(dateString);
    
    // Count consecutive days before this date
    let count = 1; // Include this date
    for (let i = dateIndex - 1; i >= 0; i--) {
      const currentDate = new Date(completedDates[i]);
      const nextDate = new Date(completedDates[i + 1]);
      
      // Check if dates are consecutive
      const diffTime = nextDate.getTime() - currentDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      
      if (diffDays === 1) {
        count++;
      } else {
        break;
      }
    }
    
    return count;
  };

  const getStreakColor = (count) => {
    if (count >= 10) return 'bg-fuchsia-600';
    if (count >= 7) return 'bg-purple-600';
    if (count >= 5) return 'bg-indigo-600';
    if (count >= 3) return 'bg-blue-600';
    return 'bg-teal-600';
  };

  const getStreakSize = (count) => {
    if (count >= 10) return 'scale-125';
    if (count >= 7) return 'scale-115';
    if (count >= 5) return 'scale-110';
    if (count >= 3) return 'scale-105';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habits & Goals</h1>
      </div>

      <div className="bg-gradient-to-r from-fuchsia-500 to-secondary-500 rounded-xl p-4 shadow-lg text-white mb-6">
        <div className="flex items-center gap-4 border-b border-white/20 pb-4 mb-4">
          <img 
            src="https://images.unsplash.com/photo-1484981184820-2e84ea0af397?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxtaW5pbWFsaXN0JTIwaGFiaXQlMjB0cmFja2VyJTIwY2FsZW5kYXIlMjBtb250aGx5JTIwdmlldyUyMGNvbG9yZnVsfGVufDB8fHx8MTc0ODQxNTk1N3ww&ixlib=rb-4.1.0&fit=fillmax&h=600&w=800"
            alt="Calendar showing January"
            className="w-20 h-20 object-cover rounded-lg border-2 border-white/30 shadow-lg"
          />
          <div>
            <h2 className="text-lg font-semibold">Track Your Progress</h2>
            <p className="text-white/80">Track your habits daily and set goals to achieve long-term success. Each completed habit or goal earns you 5 XP</p>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <button 
            className={`flex-1 py-2 rounded-lg font-medium transition-all duration-300 ${
              tabView === 'habits' 
                ? 'bg-white text-fuchsia-600 shadow-lg' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => setTabView('habits')}
          >
            <Activity size={18} className="inline mr-2" />
            Habits
          </button>
          <button 
            className={`flex-1 py-2 rounded-lg font-medium transition-all duration-300 ${
              tabView === 'goals' 
                ? 'bg-white text-secondary-600 shadow-lg' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => setTabView('goals')}
          >
            <Flag size={18} className="inline mr-2" />
            Goals
          </button>
        </div>

        {tabView === 'habits' ? (
          <form onSubmit={handleAddHabit} className="flex gap-2">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Add a new habit..."
              className="input flex-1 border-0 shadow-inner"
              required
            />
            <button type="submit" className="btn bg-white text-fuchsia-600 hover:bg-white/90">
              <Plus size={18} />
              <span className="ml-1">Add</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleAddGoal} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a new goal..."
                className="input flex-1 border-0 shadow-inner"
                required
              />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="input w-40 border-0 shadow-inner"
                required
              />
            </div>
            <button type="submit" className="btn bg-white text-secondary-600 hover:bg-white/90">
              <Plus size={18} />
              <span className="ml-1">Add Goal</span>
            </button>
          </form>
        )}
      </div>

      {tabView === 'habits' && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`btn ${habitFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setHabitFilter('all')}
          >
            All Habits
          </button>
          <button
            className={`btn ${habitFilter === 'active' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setHabitFilter('active')}
          >
            Active
          </button>
          <button
            className={`btn ${habitFilter === 'inactive' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setHabitFilter('inactive')}
          >
            Inactive
          </button>
          
          <div className="ml-auto flex gap-2">
            <button
              className={`btn ${habitView === 'week' ? 'bg-fuchsia-500 text-white hover:bg-fuchsia-600 dark:hover:bg-fuchsia-400' : 'btn-outline'}`}
              onClick={() => setHabitView('week')}
            >
              Weekly View
            </button>
            <button
              className={`btn ${habitView === 'month' ? 'bg-fuchsia-500 text-white hover:bg-fuchsia-600 dark:hover:bg-fuchsia-400' : 'btn-outline'}`}
              onClick={() => setHabitView('month')}
            >
              Monthly View
            </button>
          </div>
        </div>
      )}

      {tabView === 'goals' && (
        <div className="flex gap-2 mb-4">
          <button
            className={`btn ${goalFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setGoalFilter('all')}
          >
            All Goals
          </button>
          <button
            className={`btn ${goalFilter === 'active' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setGoalFilter('active')}
          >
            In Progress
          </button>
          <button
            className={`btn ${goalFilter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setGoalFilter('completed')}
          >
            Completed
          </button>
        </div>
      )}

      {tabView === 'habits' && habitView === 'week' && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-r from-primary-500 to-fuchsia-500 text-white p-2 rounded-lg shadow-md">
              <Activity size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-medium dark:text-white">Weekly Habit Tracker</h2>
          </div>

          {habitItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 w-1/4 dark:text-gray-300">Habit</th>
                    <th className="text-center p-2 w-1/12 dark:text-gray-300">Streak</th>
                    {weekDays.map((day) => (
                      <th key={day.dateString} className="text-center p-2">
                        <div className={`flex flex-col items-center ${day.isToday ? 'text-primary-600 dark:text-primary-400' : 'dark:text-gray-300'}`}>
                          <span className="text-xs">{day.dayName}</span>
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full ${day.isToday ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}>
                            {day.dayNumber}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="w-10 dark:text-gray-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {habitItems.map((habit) => (
                    <tr key={habit.id} className="border-t dark:border-gray-700">
                      <td className="p-2">
                        <div className="font-medium dark:text-gray-300">{habit.title}</div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Award size={16} className="text-yellow-500" />
                          <span className="dark:text-gray-300">{habit.streak}</span>
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const completed = habit.completedDates.includes(day.dateString);
                        return (
                          <td key={`${habit.id}-${day.dateString}`} className="p-2 text-center">
                            <button
                              onClick={() => day.dateString === format(today, 'yyyy-MM-dd') && toggleHabitCompletion(habit.id)}
                              className={`w-8 h-8 rounded-full border flex items-center justify-center
                                ${completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400 dark:border-gray-600'}
                                ${day.dateString === format(today, 'yyyy-MM-dd') ? 'hover:border-green-500' : 'opacity-70 cursor-default'}
                              `}
                              disabled={day.dateString == format(today, 'yyyy-MM-dd')}
                            >
                              {completed && <Check size={16} />}
                            </button>
                          </td>
                        );
                      })}
                      <td className="p-2">
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No habits yet. Add a habit to start tracking</p>
            </div>
          )}
        </div>
      )}

      {tabView === 'habits' && habitView === 'month' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-primary-500 to-fuchsia-500 text-white p-2 rounded-lg shadow-md">
                <Calendar size={20} className="text-white" />
              </div>
              <h2 className="text-lg font-medium dark:text-white">Monthly Habit Tracker</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft size={20} className="dark:text-gray-300" />
              </button>
              <span className="font-medium dark:text-gray-300">{format(selectedMonth, 'MMMM yyyy')}</span>
              <button
                onClick={nextMonth}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight size={20} className="dark:text-gray-300" />
              </button>
            </div>
          </div>

          {habitItems.length > 0 ? (
            <div className="space-y-8">
              {habitItems.map((habit) => (
                <div key={habit.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-full ${
                        habit.streak > 10 ? 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-300' :
                        habit.streak > 5 ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' :
                        habit.streak > 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        <Star size={20} className="fill-current" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg dark:text-white">{habit.title}</h3>
                        <div className="flex items-center mt-1">
                          <span className={`text-sm ${
                            habit.streak > 10 ? 'text-fuchsia-600 dark:text-fuchsia-300' :
                            habit.streak > 5 ? 'text-purple-600 dark:text-purple-300' :
                            habit.streak > 0 ? 'text-blue-600 dark:text-blue-300' :
                            'text-gray-500 dark:text-gray-400'
                          }`}>
                            {habit.streak} day streak
                          </span>
                          
                          {habit.streak > 0 && (
                            <div className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 flex items-center">
                              <Award size={12} className="mr-1" />
                              Active
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => format(new Date(), 'yyyy-MM-dd') && toggleHabitCompletion(habit.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center ${
                          habit.completedDates.includes(format(new Date(), 'yyyy-MM-dd'))
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {habit.completedDates.includes(format(new Date(), 'yyyy-MM-dd')) ? (
                          <>
                            <CheckSquare size={16} className="mr-1" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <Square size={16} className="mr-1" />
                            <span>Mark Today</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border dark:border-gray-700 shadow-inner">
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-xs text-gray-500 dark:text-gray-400 font-medium py-1">
                          {day.charAt(0)}
                        </div>
                      ))}
                      
                      {generateCalendarDays().map((week, weekIndex) => (
                        week.map((day, dayIndex) => {
                          if (day) return (
                            <div key={`empty-${weekIndex}-${dayIndex}`} className="h-8"></div>
                          );
                          
                          const dateString = format(day, 'yyyy-MM-dd');
                          const isCurrentMonth = isSameMonth(day, selectedMonth);
                          const isCompleted = wasHabitCompletedOnDate(habit.id, dateString);
                          const isToday = isSameDay(day, new Date());
                          const consecutiveCount = isCompleted ? getConsecutiveCompletionCount(habit, dateString) : 0;
                          const streakColor = getStreakColor(consecutiveCount);
                          const streakSize = getStreakSize(consecutiveCount);
                          
                          return (
                            <div 
                              key={dateString}
                              className={`
                                relative h-10 flex items-center justify-center rounded-md 
                                ${isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : ''}
                                ${isToday ? 'border-2 border-primary-500 dark:border-primary-400' : ''}
                                ${isCompleted 
                                  ? `${streakColor} text-white shadow-sm transform ${streakSize} hover:shadow-md transition-all duration-200` 
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'}
                              `}
                              title={`${format(day, 'MMM d, yyyy')}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                              onMouseEnter={() => setShowTooltip(`${habit.id}-${dateString}`)}
                              onMouseLeave={() => setShowTooltip(null)}
                            >
                              <span className={isCompleted ? 'font-bold' : ''}>
                                {getDate(day)}
                              </span>
                              
                              {isCompleted && consecutiveCount > 1 && (
                                <div className="absolute top-0 right-0 -mt-1 -mr-1 w-4 h-4 flex items-center justify-center rounded-full bg-white text-[10px] text-black font-bold border border-white shadow-sm">
                                  {consecutiveCount}
                                </div>
                              )}
                              
                              {showTooltip === `${habit.id}-${dateString}` && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 z-10 bg-black text-white text-xs rounded p-1 whitespace-nowrap shadow-lg">
                                  {isCompleted ? (
                                    consecutiveCount > 1 ? (
                                      `${consecutiveCount} day streak`
                                    ) : (
                                      'Completed'
                                    )
                                  ) : (
                                    'Not completed'
                                  )}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Completed Days:</span>
                      <span className="ml-1 font-medium text-primary-600 dark:text-primary-400">
                        {monthDays.filter(day => wasHabitCompletedOnDate(habit.id, format(day, 'yyyy-MM-dd'))).length}
                      </span>
                    </div>
                    
                    <div className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Completion Rate:</span>
                      <span className="ml-1 font-medium text-primary-600 dark:text-primary-400">
                        {Math.round((monthDays.filter(day => wasHabitCompletedOnDate(habit.id, format(day, 'yyyy-MM-dd'))).length / monthDays.length) * 100)}%
                      </span>
                    </div>
                    
                    {habit.streak > 0 && (
                      <div className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Current Streak:</span>
                        <span className="ml-1 font-medium text-primary-600 dark:text-primary-400">
                          {habit.streak} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No habits yet. Add a habit to start tracking</p>
            </div>
          )}
          
          <div className="mt-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <h3 className="font-medium text-gray-800 dark:text-white mb-2">Habit Tracker Legend</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-teal-600"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">1-2 days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-blue-600"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">3-4 days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-indigo-600"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">5-6 days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-purple-600"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">7-9 days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-fuchsia-600"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">10+ days</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-5 h-5 rounded-md border border-gray-200 dark:border-gray-600"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Not completed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tabView === 'goals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goalItems.length > 0 ? (
            goalItems.map((goal) => (
              <div key={goal.id} className="card hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      goal.progress === 100 
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md' 
                        : 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md'
                    }`}>
                      {goal.progress === 100 ? <Check size={20} /> : <Flag size={20} />}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg dark:text-white">{goal.title}</h3>
                      {goal.targetDate && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="mt-3">
                        <div className="flex items-center">
                          <div className="flex-1 mr-4">
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${
                                  goal.progress === 100 
                                    ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                    : 'bg-gradient-to-r from-primary-400 to-primary-600'
                                }`}
                                style={{ width: `${goal.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className={`text-sm font-medium ${
                            goal.progress === 100 ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-primary-400'
                          }`}>{goal.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHabit(goal.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash size={18} />
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
                  {[0, 25, 50, 75, 100].map((progress) => (
                    <button
                      key={progress}
                      onClick={() => updateHabitProgress(goal.id, progress)}
                      className={`flex-1 py-1 text-xs rounded transition-all duration-200 ${
                        goal.progress === progress
                          ? progress === 100 
                            ? 'bg-green-500 text-white shadow-sm' 
                            : 'bg-primary-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {progress}%
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="card col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              <Flag size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No goals matching your filter. Add your first goal to get started</p>
            </div>
          )}
        </div>
      )}

      <div className="card bg-gray-50 dark:bg-gray-800/50">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <img 
            src="https://images.unsplash.com/photo-1487260211189-670c54da558d?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwaGFiaXQlMjB0cmFja2VyJTIwY2FsZW5kYXIlMjBtb250aGx5JTIwdmlldyUyMGNvbG9yZnVsfGVufDB8fHx8MTc0ODQxNTk1N3ww&ixlib=rb-4.1.0&fit=fillmax&h=400&w=600"
            alt="Person walking on snowfield"
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h2 className="text-lg font-medium mb-2 dark:text-white">Building Better Habits & Achieving Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <ChevronRight size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-200">Start Small</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Begin with tiny habits that take less than two minutes to complete.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-200">Be Consistent</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Try to perform habits at the same time each day to build stronger routines.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-200">Set SMART Goals</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Goals should be Specific, Measurable, Achievable, Relevant, and Time-bound.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-200">Track Progress</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Regular tracking helps maintain motivation and shows your improvement over time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Square component for habits that aren't completed
const Square = ({ size, className = "" }) => {
  return (
    <div className={`border-2 rounded-sm ${className}`} style={{ width, height: size }}></div>
  );
};

export default HabitsGoals;
 