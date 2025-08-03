import { createContext, useContext, useState, useEffect } from 'react';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import { triggerLevelUpConfetti } from '../utils/confetti';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Helper function to get user-specific storage key
  const getUserStorageKey = (key) => {
    return user?.id ? `user_${user.id}_${key}` : null;
  };
  
  // Helper function to get user-specific data
  const getUserData = (key, defaultValue) => {
    if (!user?.id) return defaultValue;
    const storageKey = getUserStorageKey(key);
    if (!storageKey) return defaultValue;
    
    const saved = localStorage.getItem(storageKey);
    const result = saved ? JSON.parse(saved) : defaultValue;
    console.log(`Loading user data for ${key}:`, result);
    return result;
  };
  
  // Helper function to save user-specific data
  const saveUserData = (key, data) => {
    if (!user?.id) return;
    const storageKey = getUserStorageKey(key);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log(`Saving user data for ${key}:`, data);
    }
  };
  
  // User Stats
  const [xp, setXp] = useState(() => {
    return getUserData('xp', 0);
  });
  
  const [level, setLevel] = useState(() => {
    return getUserData('level', 1);
  });
  
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  
  // Tasks
  const [tasks, setTasks] = useState(() => {
    return getUserData('tasks', []);
  });
  
  // Assignments
  const [assignments, setAssignments] = useState(() => {
    return getUserData('assignments', []);
  });
  
  // Resources
  const [resources, setResources] = useState(() => {
    return getUserData('resources', []);
  });
  
  // Reading List
  const [readingList, setReadingList] = useState(() => {
    return getUserData('reading_list', []);
  });
  
  // Wishlist
  const [wishlist, setWishlist] = useState(() => {
    return getUserData('wishlist', []);
  });
  
  // Grades
  const [grades, setGrades] = useState(() => {
    return getUserData('grades', []);
  });
  
  // Habits & Goals
  const [habits, setHabits] = useState(() => {
    return getUserData('habits', []);
  });
  
  // Journal
  const [journals, setJournals] = useState(() => {
    return getUserData('journals', []);
  });
  
  // Tests
  const [tests, setTests] = useState(() => {
    return getUserData('tests', []);
  });
  
  // Pomodoro Sessions
  const [pomodoroSessions, setPomodoroSessions] = useState(() => {
    return getUserData('pomodoro_sessions', []);
  });
  
  // Time Slots
  const [timeSlots, setTimeSlots] = useState(() => {
    return getUserData('time_slots', []);
  });
  
  // Theme
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = getUserData('dark_mode', null);
    if (savedDarkMode !== null) {
      return savedDarkMode;
    } else {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });
  
  // Save data when it changes
  useEffect(() => {
    if (user?.id) {
      saveUserData('xp', xp);
    }
  }, [xp, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('level', level);
    }
  }, [level, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('tasks', tasks);
    }
  }, [tasks, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('assignments', assignments);
    }
  }, [assignments, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('resources', resources);
    }
  }, [resources, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('reading_list', readingList);
    }
  }, [readingList, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('wishlist', wishlist);
    }
  }, [wishlist, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('grades', grades);
    }
  }, [grades, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('habits', habits);
    }
  }, [habits, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('journals', journals);
    }
  }, [journals, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('tests', tests);
    }
  }, [tests, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('pomodoro_sessions', pomodoroSessions);
    }
  }, [pomodoroSessions, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('time_slots', timeSlots);
    }
  }, [timeSlots, user?.id]);
  
  useEffect(() => {
    if (user?.id) {
      saveUserData('dark_mode', darkMode);
    }
  }, [darkMode, user?.id]);
  
  // Reload data when user changes
  useEffect(() => {
    if (user?.id) {
      // Reload all user-specific data
      setXp(getUserData('xp', 0));
      setLevel(getUserData('level', 1));
      setTasks(getUserData('tasks', []));
      setAssignments(getUserData('assignments', []));
      setResources(getUserData('resources', []));
      setReadingList(getUserData('reading_list', []));
      setWishlist(getUserData('wishlist', []));
      setGrades(getUserData('grades', []));
      setHabits(getUserData('habits', []));
      setJournals(getUserData('journals', []));
      setTests(getUserData('tests', []));
      setPomodoroSessions(getUserData('pomodoro_sessions', []));
      setTimeSlots(getUserData('time_slots', []));
      
      const savedDarkMode = getUserData('dark_mode', null);
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode);
      }
    } else {
      // Clear data when user logs out
      setXp(0);
      setLevel(1);
      setTasks([]);
      setAssignments([]);
      setResources([]);
      setReadingList([]);
      setWishlist([]);
      setGrades([]);
      setHabits([]);
      setJournals([]);
      setTests([]);
      setPomodoroSessions([]);
      setTimeSlots([]);
      setShowLevelUpModal(false);
    }
  }, [user?.id]);
  
  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Helper function to add XP
  const addXp = (amount) => {
    setXp(prevXp => prevXp + amount);
  };
  
  // Check for level up when XP changes
  useEffect(() => {
    const newLevel = Math.floor(xp / 100) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setShowLevelUpModal(true);
      triggerLevelUpConfetti();
    }
  }, [xp, level]);
  
  // Tasks
  const addTask = (task) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false
    };
    setTasks([...tasks, newTask]);
  };
  
  const toggleTaskCompletion = (id) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        // Add XP if task is completed, subtract if uncompleted
        if (newCompleted) {
          addXp(5);
        } else {
          addXp(-5);
        }
        return { ...task, completed: newCompleted };
      }
      return task;
    });
    setTasks(updatedTasks);
  };
  
  const updateTask = (id, updatedTask) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, ...updatedTask };
      }
      return task;
    });
    setTasks(updatedTasks);
  };
  
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  // Assignments
  const addAssignment = (assignment) => {
    const newAssignment = {
      ...assignment,
      id: `study-assignment-${Date.now()}`
    };
    setAssignments([...assignments, newAssignment]);
    
    // Create a time slot for this assignment if it has a time
    if (assignment.time) {
      // Create a time slot with 1 hour duration as default
      const startTime = assignment.time;
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + 1 > 23 ? 23 : hours + 1;
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      addTimeSlot({
        title: assignment.title,
        date: assignment.dueDate,
        start: startTime,
        end: endTime,
        type: 'assignment',
        description: assignment.description || `${assignment.course} assignment`,
        relatedItemId: newAssignment.id
      });
    }
  };
  
  const updateAssignmentStatus = (id, newStatus, currentStatus) => {
    // Add XP if changing to completed, remove if changing from completed
    if (newStatus === 'completed' && currentStatus !== 'completed') {
      addXp(5);
    } else if (currentStatus === 'completed' && newStatus !== 'completed') {
      addXp(-5);
    }
    
    const updatedAssignments = assignments.map(assignment => {
      if (assignment.id === id) {
        return { ...assignment, status: newStatus };
      }
      return assignment;
    });
    setAssignments(updatedAssignments);
  };
  
  const deleteAssignment = (id) => {
    // Delete any time slots associated with this assignment
    setTimeSlots(timeSlots.filter(slot => slot.relatedItemId !== id));
    
    // Remove the assignment itself
    setAssignments(assignments.filter(assignment => assignment.id !== id));
  };
  
  // Resources
  const addResource = (resource) => {
    const newResource = {
      ...resource,
      id: `resource-${Date.now()}`,
      dateAdded: new Date().toISOString()
    };
    setResources([...resources, newResource]);
  };
  
  const deleteResource = (id) => {
    setResources(resources.filter(resource => resource.id !== id));
  };
  
  const linkResourceToAssignment = (resourceId, assignmentId) => {
    const updatedResources = resources.map(resource => {
      if (resource.id === resourceId) {
        const linkedAssignments = resource.linkedAssignments || [];
        if (!linkedAssignments.includes(assignmentId)) {
          return {
            ...resource,
            linkedAssignments: [...linkedAssignments, assignmentId]
          };
        }
      }
      return resource;
    });
    setResources(updatedResources);
  };
  
  // Reading List
  const addReadingItem = (item) => {
    const newItem = {
      ...item,
      id: `reading-${Date.now()}`,
      dateAdded: new Date().toISOString()
    };
    setReadingList([...readingList, newItem]);
  };
  
  const toggleReadingItemCompletion = (id) => {
    const updatedList = readingList.map(item => {
      if (item.id === id) {
        const newCompleted = !item.completed;
        // Add XP if completed, subtract if uncompleted
        if (newCompleted) {
          addXp(5);
        } else {
          addXp(-5);
        }
        return { ...item, completed: newCompleted };
      }
      return item;
    });
    setReadingList(updatedList);
  };
  
  const deleteReadingItem = (id) => {
    setReadingList(readingList.filter(item => item.id !== id));
  };
  
  // Wishlist
  const addWishlistItem = (item) => {
    const newItem = {
      ...item,
      id: `wishlist-${Date.now()}`,
      dateAdded: new Date().toISOString(),
      purchased: false
    };
    setWishlist([...wishlist, newItem]);
  };
  
  const toggleWishlistItemPurchased = (id) => {
    const updatedList = wishlist.map(item => {
      if (item.id === id) {
        const newPurchased = !item.purchased;
        if (newPurchased) {
          addXp(10);
        } else {
          addXp(-10);
        }
        return { ...item, purchased: newPurchased };
      }
      return item;
    });
    setWishlist(updatedList);
  };
  
  const deleteWishlistItem = (id) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };
  
  // Grades
  const addGrade = (grade) => {
    const newGrade = {
      ...grade,
      id: `grade-${Date.now()}`
    };
    setGrades([...grades, newGrade]);
  };
  
  const updateGrade = (id, updatedGrade) => {
    const updatedGrades = grades.map(grade => {
      if (grade.id === id) {
        return { ...grade, ...updatedGrade };
      }
      return grade;
    });
    setGrades(updatedGrades);
  };
  
  const deleteGrade = (id) => {
    setGrades(grades.filter(grade => grade.id !== id));
  };
  
  // Habits & Goals
  const addHabit = (habit) => {
    const newHabit = {
      ...habit,
      id: `habit-${Date.now()}`,
      streak: 0,
      completedDates: [],
      progress: habit.isGoal ? 0 : undefined
    };
    setHabits([...habits, newHabit]);
  };
  
  const toggleHabitCompletion = (id) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const updatedHabits = habits.map(habit => {
      if (habit.id === id) {
        const isCompleted = habit.completedDates.includes(today);
        let updatedCompletedDates;
        let updatedStreak;
        
        if (isCompleted) {
          // Uncompleting today's habit
          updatedCompletedDates = habit.completedDates.filter(date => date !== today);
          // Reduce XP
          addXp(-5);
          // Reduce streak
          updatedStreak = Math.max(0, habit.streak - 1);
        } else {
          // Completing today's habit
          updatedCompletedDates = [...habit.completedDates, today];
          // Add XP
          addXp(5);
          
          // Calculate streak
          const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
          const hasYesterday = habit.completedDates.includes(yesterday);
          // If streak is already active or yesterday was completed, increment streak
          updatedStreak = (habit.streak > 0 || hasYesterday) ? habit.streak + 1 : 1;
        }
        
        return {
          ...habit,
          completedDates: updatedCompletedDates,
          streak: updatedStreak
        };
      }
      return habit;
    });
    
    setHabits(updatedHabits);
  };
  
  const updateHabitProgress = (id, progress) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === id) {
        const oldProgress = habit.progress || 0;
        const newProgress = progress;
        
        // Add or subtract XP based on progress change
        if (newProgress === 100 && oldProgress !== 100) {
          addXp(5); // Completed goal
        } else if (oldProgress === 100 && newProgress !== 100) {
          addXp(-5); // Uncompleted goal
        }
        
        return { ...habit, progress };
      }
      return habit;
    });
    setHabits(updatedHabits);
  };
  
  const deleteHabit = (id) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };
  
  // Journal
  const addJournal = (journal) => {
    const newJournal = {
      ...journal,
      id: `journal-${Date.now()}`
    };
    setJournals([...journals, newJournal]);
  };
  
  const updateJournal = (id, updatedJournal) => {
    const updatedJournals = journals.map(journal => {
      if (journal.id === id) {
        return { ...journal, ...updatedJournal };
      }
      return journal;
    });
    setJournals(updatedJournals);
  };
  
  const deleteJournal = (id) => {
    setJournals(journals.filter(journal => journal.id !== id));
  };
  
  // Tests
  const addTest = (test) => {
    const newTest = {
      ...test,
      id: `test-${Date.now()}`
    };
    setTests([...tests, newTest]);
    
    // Create a time slot for this test
    if (test.time) {
      // Create a time slot with 2 hours duration as default for tests
      const startTime = test.time;
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + 2 > 23 ? 23 : hours + 2;
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      addTimeSlot({
        title: `Test: ${test.title}`,
        date: test.date,
        start: startTime,
        end: endTime,
        type: 'test',
        description: `${test.subject} test${test.location ? ` at ${test.location}` : ''}`,
        relatedItemId: newTest.id
      });
    }
  };
  
  const updateTest = (id, updatedTest) => {
    const updatedTests = tests.map(test => {
      if (test.id === id) {
        // Update related time slot if date or time changed
        if (updatedTest.date || updatedTest.time) {
          const testTimeSlot = timeSlots.find(slot => slot.relatedItemId === id);
          if (testTimeSlot) {
            const updatedTimeSlot = { ...testTimeSlot };
            
            if (updatedTest.date) {
              updatedTimeSlot.date = updatedTest.date;
            }
            
            if (updatedTest.time) {
              updatedTimeSlot.start = updatedTest.time;
              // Recalculate end time (2 hours later)
              const [hours, minutes] = updatedTest.time.split(':').map(Number);
              const endHours = hours + 2 > 23 ? 23 : hours + 2;
              updatedTimeSlot.end = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
            
            if (updatedTest.title) {
              updatedTimeSlot.title = `Test: ${updatedTest.title}`;
            }
            
            // Update the time slot
            const updatedTimeSlots = timeSlots.map(slot => 
              slot.id === testTimeSlot.id ? updatedTimeSlot : slot
            );
            setTimeSlots(updatedTimeSlots);
          }
        }
        
        return { ...test, ...updatedTest };
      }
      return test;
    });
    setTests(updatedTests);
  };
  
  const deleteTest = (id) => {
    // Delete related time slot
    setTimeSlots(timeSlots.filter(slot => slot.relatedItemId !== id));
    
    // Delete test
    setTests(tests.filter(test => test.id !== id));
  };
  
  const linkTestToGrade = (testId, gradeId) => {
    const updatedTests = tests.map(test => {
      if (test.id === testId) {
        return { ...test, graded: true, gradeId };
      }
      return test;
    });
    setTests(updatedTests);
  };
  
  // Pomodoro
  const addPomodoroSession = (session) => {
    const newSession = {
      ...session,
      id: `pomodoro-${Date.now()}`
    };
    setPomodoroSessions([...pomodoroSessions, newSession]);
    addXp(Math.floor(session.focusTime / 5)); // 1 XP per 5 minutes of focus time
  };
  
  const getPomodoroStats = () => {
    const totalSessions = pomodoroSessions.length;
    const totalFocusTime = pomodoroSessions.reduce((acc, session) => acc + session.focusTime, 0);
    const totalBreakTime = pomodoroSessions.reduce((acc, session) => acc + session.breakTime, 0);
    
    // Get stats for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = format(addDays(new Date(), -i), 'yyyy-MM-dd');
      const daySessions = pomodoroSessions.filter(session => 
        session.date === date
      );
      
      return {
        date,
        sessions: daySessions.length,
        focusTime: daySessions.reduce((acc, session) => acc + session.focusTime, 0),
        breakTime: daySessions.reduce((acc, session) => acc + session.breakTime, 0)
      };
    }).reverse(); // Reverse to get chronological order
    
    return {
      totalSessions,
      totalFocusTime,
      totalBreakTime,
      dailyStats: last7Days
    };
  };
  
  // Calendar events
  const getCalendarEvents = () => {
    const events = [];
    
    // Add tasks with due dates
    tasks.forEach(task => {
      if (task.dueDate) {
        events.push({
          id: task.id,
          title: task.title,
          date: task.dueDate,
          time: task.time,
          type: 'task',
          status: task.completed ? 'completed' : 'not-started'
        });
      }
    });
    
    // Add assignments
    assignments.forEach(assignment => {
      events.push({
        id: assignment.id,
        title: assignment.title,
        date: assignment.dueDate,
        time: assignment.time,
        type: 'assignment',
        status: assignment.status,
        subject: assignment.course,
        description: assignment.description
      });
    });
    
    // Add habits with completed dates
    habits.forEach(habit => {
      if (habit.isGoal) {
        habit.completedDates.forEach(date => {
          events.push({
            id: `${habit.id}-${date}`,
            title: habit.title,
            date,
            type: 'habit'
          });
        });
      }
    });
    
    // Add goals with target dates
    habits.forEach(habit => {
      if (habit.isGoal && habit.targetDate) {
        events.push({
          id: habit.id,
          title: habit.title,
          date: habit.targetDate,
          type: 'goal',
          status: habit.progress === 100 ? 'completed' : 'in-progress'
        });
      }
    });
    
    // Add journal entries
    journals.forEach(journal => {
      events.push({
        id: journal.id,
        title: journal.title,
        date: format(parseISO(journal.date), 'yyyy-MM-dd'),
        type: 'journal'
      });
    });
    
    // Add tests
    tests.forEach(test => {
      events.push({
        id: test.id,
        title: test.title,
        date: test.date,
        time: test.time,
        type: 'test',
        subject: test.subject
      });
    });
    
    return events;
  };
  
  // Time slots
  const addTimeSlot = (timeSlot) => {
    const newTimeSlot = {
      ...timeSlot,
      id: `timeslot-${Date.now()}`
    };
    setTimeSlots([...timeSlots, newTimeSlot]);
  };
  
  const deleteTimeSlot = (id) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const contextValue = {
    // User Stats
    xp,
    level,
    
    // Tasks
    tasks,
    addTask,
    toggleTaskCompletion,
    updateTask,
    deleteTask,
    
    // Assignments
    assignments,
    addAssignment,
    updateAssignmentStatus,
    deleteAssignment,
    
    // Resources
    resources,
    addResource,
    deleteResource,
    linkResourceToAssignment,
    
    // Reading List
    readingList,
    addReadingItem,
    toggleReadingItemCompletion,
    deleteReadingItem,
    
    // Wishlist
    wishlist,
    addWishlistItem,
    toggleWishlistItemPurchased,
    deleteWishlistItem,
    
    // Grades
    grades,
    addGrade,
    updateGrade,
    deleteGrade,
    
    // Habits & Goals
    habits,
    addHabit,
    toggleHabitCompletion,
    updateHabitProgress,
    deleteHabit,
    
    // Journal
    journals,
    addJournal,
    updateJournal,
    deleteJournal,
    
    // Tests
    tests,
    addTest,
    updateTest,
    deleteTest,
    linkTestToGrade,
    
    // Pomodoro
    addPomodoroSession,
    getPomodoroStats,
    
    // Calendar Events
    getCalendarEvents,
    
    // Time Slots
    timeSlots,
    addTimeSlot,
    deleteTimeSlot,
    
    // Theme
    darkMode,
    toggleDarkMode,
    
    // Level Up Modal
    showLevelUpModal,
    setShowLevelUpModal
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
 