import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Trash, 
  ChevronRight,
  ArrowDown,
  ArrowUp,
  Link,
  CheckSquare,
  Edit,
  FileText,
  Play
} from 'lucide-react';
import { format, addDays, startOfDay, isBefore, isAfter, parseISO } from 'date-fns';




const StudyPlanner = () => {
  const navigate = useNavigate();
  const { assignments, tasks, habits, resources, addXP } = useApp();
  const [studyTasks, setStudyTasks] = useState(() => {
    const savedTasks = localStorage.getItem('studydash_study_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      {
        id: `study-${Date.now() - 1000}`,
        title: "Review Physics Chapter 4",
        subject: "Physics",
        duration: 45,
        deadline: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        priority: "high",
        difficulty: "medium",
        isRecurring: false,
        completed: false,
        isBacklog: false,
        time: "14:00"
      },
      {
        id: `study-${Date.now() - 2000}`,
        title: "Practice Calculus Problems",
        subject: "Mathematics",
        duration: 60,
        deadline: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        priority: "medium",
        difficulty: "hard",
        isRecurring: false,
        completed: false,
        isBacklog: false,
        time: "16:30"
      },
      {
        id: `study-${Date.now() - 3000}`,
        title: "Daily Vocabulary Review",
        subject: "Language",
        duration: 20,
        priority: "medium",
        difficulty: "easy",
        isRecurring: true,
        recurringDays: [1, 3, 5], // Monday, Wednesday, Friday
        completed: false,
        isBacklog: false
      }
    ];
  });
  
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(30);
  const [deadline, setDeadline] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [difficulty, setDifficulty] = useState('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState([]);
  const [isBacklog, setIsBacklog] = useState(false);
  const [dependsOn, setDependsOn] = useState([]);
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState('priority');
  const [viewMode, setViewMode] = useState('plan');
  const [editingTask, setEditingTask] = useState(null);
  const [linkedResources, setLinkedResources] = useState({});
  const [showLinkedResources, setShowLinkedResources] = useState({});
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [showSubtasks, setShowSubtasks] = useState({});
  
  // Save study tasks to localStorage
  useEffect(() => {
    localStorage.setItem('studydash_study_tasks', JSON.stringify(studyTasks));
  }, [studyTasks]);
  
  // Load linked resources
  useEffect(() => {
    const savedLinks = localStorage.getItem('studydash_task_resources');
    if (savedLinks) {
      setLinkedResources(JSON.parse(savedLinks));
    }
  }, []);
  
  // Save linked resources
  useEffect(() => {
    localStorage.setItem('studydash_task_resources', JSON.stringify(linkedResources));
  }, [linkedResources]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && subject.trim()) {
      if (editingTask) {
        // Update existing task
        setStudyTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === editingTask ? {
              ...task,
              title: title.trim(),
              subject: subject.trim(),
              duration,
              deadline: deadline || undefined,
              time: time || undefined,
              priority,
              difficulty,
              isRecurring,
              recurringDays: isRecurring ? recurringDays : undefined,
              isBacklog,
              dependsOn: dependsOn.length > 0 ? dependsOn : undefined,
              notes: notes.trim() || undefined,
              subtasks: [...(task.subtasks || []), ...subtasks.map(st => ({
                id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                title: st.title,
                completed: false
              }))]
            } : task
          )
        );
        setEditingTask(null);
      } else {
        // Create new task
        const newTask = {
          id: `study-${Date.now()}`,
          title: title.trim(),
          subject: subject.trim(),
          duration,
          deadline: deadline || undefined,
          time: time || undefined,
          priority,
          difficulty,
          isRecurring,
          recurringDays: isRecurring ? recurringDays : undefined,
          completed,
          isBacklog,
          dependsOn: dependsOn.length > 0 ? dependsOn : undefined,
          notes: notes.trim() || undefined,
          subtasks: subtasks.length > 0 ? subtasks.map(st => ({
            id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: st.title,
            completed: false
          })) : undefined
        };
        setStudyTasks(prev => [...prev, newTask]);
        addXP(2); // Add XP for creating a new study task
      }
      resetForm();
    }
  };
  
  const editTask = (task) => {
    setTitle(task.title);
    setSubject(task.subject);
    setDuration(task.duration);
    setDeadline(task.deadline || '');
    setTime(task.time || '');
    setPriority(task.priority);
    setDifficulty(task.difficulty);
    setIsRecurring(task.isRecurring);
    setRecurringDays(task.recurringDays || []);
    setIsBacklog(task.isBacklog);
    setDependsOn(task.dependsOn || []);
    setNotes(task.notes || '');
    setSubtasks([]);
    setEditingTask(task.id);
    setShowForm(true);
  };
  
  const resetForm = () => {
    setTitle('');
    setSubject('');
    setDuration(30);
    setDeadline('');
    setTime('');
    setPriority('medium');
    setDifficulty('medium');
    setIsRecurring(false);
    setRecurringDays([]);
    setIsBacklog(false);
    setDependsOn([]);
    setNotes('');
    setSubtasks([]);
    setShowForm(false);
    setEditingTask(null);
  };
  
  const toggleRecurringDay = (day) => {
    if (recurringDays.includes(day)) {
              setRecurringDays(recurringDays.filter(d => d === day));
    } else {
      setRecurringDays([...recurringDays, day]);
    }
  };
  
  const handleDeleteTask = (id) => {
    setStudyTasks(studyTasks.filter(task => task.id !== id));
    // Also remove any resource links
    const updatedLinks = {...linkedResources};
    delete updatedLinks[id];
    setLinkedResources(updatedLinks);
  };
  
  const handleToggleComplete = (id) => {
    setStudyTasks(studyTasks.map(task => {
      if (task.id === id) {
        const wasCompleted = task.completed;
        if (wasCompleted) {
          addXP(5); // Add XP for completing a study task
        } else {
          addXP(-5); // Reduce XP when downgrading from completed
        }
        return { ...task, completed: task.completed };
      }
      return task;
    }));
  };
  
  const handleToggleBacklog = (id) => {
    setStudyTasks(studyTasks.map(task => 
      task.id === id ? { ...task, isBacklog: task.isBacklog } : task
    ));
  };
  
  const handleDependencyChange = (taskId) => {
    if (dependsOn.includes(taskId)) {
              setDependsOn(dependsOn.filter(id => id !== taskId));
    } else {
      setDependsOn([...dependsOn, taskId]);
    }
  };
  
  const isDependencyCompleted = (taskId) => {
    const task = studyTasks.find(t => t.id === taskId);
    return task?.completed || false;
  };
  
  const canCompleteTask = (task) => {
    if (task.dependsOn || task.dependsOn.length === 0) return true;
    return task.dependsOn.every(depId => isDependencyCompleted(depId));
  };
  
  const linkResourceToTask = (taskId, resourceId) => {
    setLinkedResources(prev => {
      const taskResources = prev[taskId] || [];
      if (taskResources.includes(resourceId)) {
        return {
          ...prev,
          [taskId]: [...taskResources, resourceId]
        };
      }
      return prev;
    });
  };
  
  const unlinkResourceFromTask = (taskId, resourceId) => {
    setLinkedResources(prev => {
      const taskResources = prev[taskId] || [];
      return {
        ...prev,
        [taskId]: taskResources.filter(id => id !== resourceId)
      };
    });
  };
  
  const toggleShowLinkedResources = (taskId) => {
    setShowLinkedResources(prev => ({
      ...prev,
      [taskId]: prev[taskId]
    }));
  };
  
  const toggleShowSubtasks = (taskId) => {
    setShowSubtasks(prev => ({
      ...prev,
      [taskId]: prev[taskId]
    }));
  };
  
  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { title: newSubtask.trim() }]);
      setNewSubtask('');
    }
  };
  
  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };
  
  const toggleSubtaskCompletion = (taskId, subtaskId) => {
    setStudyTasks(studyTasks.map(task => {
      if (task.id === taskId && task.subtasks) {
        return {
          ...task,
          subtasks: task.subtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, completed: subtask.completed }
              : subtask
          )
        };
      }
      return task;
    }));
  };
  
  // Start a pomodoro for a specific task
  const startPomodoro = (taskId, taskTitle) => {
    // Store the current task info in localStorage
    localStorage.setItem('quick_pomodoro_task', JSON.stringify({
      id,
      title: taskTitle
    }));
    
    // Navigate to pomodoro timer
    navigate('/pomodoro');
  };
  
  const generateStudyPlan = () => {
    // Create a study plan based on deadlines and difficulty
    const now = startOfDay(new Date());
    const nonCompletedTasks = studyTasks.filter(task => task.completed && task.isBacklog);
    
    // Group tasks by urgency
    const urgentTasks = nonCompletedTasks.filter(task => 
      task.deadline && isBefore(new Date(task.deadline), addDays(now, 3))
    );
    
    const upcomingTasks = nonCompletedTasks.filter(task => 
      urgentTasks.includes(task) && 
      task.deadline && 
      isBefore(new Date(task.deadline), addDays(now, 7))
    );
    
    const laterTasks = nonCompletedTasks.filter(task => 
      urgentTasks.includes(task) && upcomingTasks.includes(task)
    );
    
    // Sort tasks by priority and difficulty
    const sortTasksByPriorityAndDifficulty = (a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const difficultyOrder = { hard: 0, medium: 1, easy: 2 };
      
      if (priorityOrder[a.priority] === priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    };
    
    // Sort each group
    urgentTasks.sort(sortTasksByPriorityAndDifficulty);
    upcomingTasks.sort(sortTasksByPriorityAndDifficulty);
    laterTasks.sort(sortTasksByPriorityAndDifficulty);
    
    // Return daily plan for the next 7 days
    const dailyPlan = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(now, i);
      const formattedDate = format(day, 'yyyy-MM-dd');
      
      // Get tasks specifically for this day based on deadline
      const todayDeadlineTasks = [...urgentTasks, ...upcomingTasks, ...laterTasks].filter(task =>
        task.deadline && format(new Date(task.deadline), 'yyyy-MM-dd') === formattedDate
      );
      
      // Distribute remaining tasks across the week
      let otherTasks = [];
      
      // Add urgent tasks first (most on day 0-2)
      if (i < 3 && urgentTasks.length > 0) {
        const remainingUrgentTasks = urgentTasks.filter(task => todayDeadlineTasks.includes(task));
        const tasksForToday = Math.ceil(remainingUrgentTasks.length / (3 - i));
        otherTasks = [...otherTasks, ...remainingUrgentTasks.slice(0, tasksForToday)];
        urgentTasks.splice(0, tasksForToday);
      }
      
      // Add upcoming tasks (spread across days 0-6)
      if (upcomingTasks.length > 0) {
        const remainingUpcomingTasks = upcomingTasks.filter(task => todayDeadlineTasks.includes(task));
        const tasksForToday = Math.ceil(remainingUpcomingTasks.length / (7 - i));
        otherTasks = [...otherTasks, ...remainingUpcomingTasks.slice(0, tasksForToday)];
        upcomingTasks.splice(0, tasksForToday);
      }
      
      // Add later tasks if we have less than 3 tasks for the day
      if ((todayDeadlineTasks.length + otherTasks.length) < 3 && laterTasks.length > 0) {
        const remainingLaterTasks = laterTasks.filter(task => todayDeadlineTasks.includes(task));
        const tasksForToday = Math.min(3 - (todayDeadlineTasks.length + otherTasks.length), remainingLaterTasks.length);
        otherTasks = [...otherTasks, ...remainingLaterTasks.slice(0, tasksForToday)];
        laterTasks.splice(0, tasksForToday);
      }
      
      // Add recurring tasks for this day
      const recurringTasksForDay = studyTasks.filter(task => 
        task.isRecurring && 
        task.recurringDays && 
        task.recurringDays.includes(day.getDay()) &&
        task.completed
      );
      
      dailyPlan.push({
        date,
        formattedDate: format(day, 'EEEE, MMM d'),
        tasks: [...todayDeadlineTasks, ...otherTasks, ...recurringTasksForDay]
      });
    }
    
    return dailyPlan;
  };
  
  const studyPlan = generateStudyPlan();
  
  // Sort study tasks
  const sortedStudyTasks = [...studyTasks].filter(task => {
    if (viewMode === 'backlog') return task.isBacklog;
    if (viewMode === 'plan') return task.isBacklog;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'deadline') {
      if (a.deadline && b.deadline) return 0;
      if (a.deadline) return 1;
      if (b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    if (sortBy === 'difficulty') {
      const difficultyOrder = { hard: 0, medium: 1, easy: 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    }
    
    return 0;
  });
  
  // Get available tasks for dependencies (non-completed tasks)
  const availableDependencyTasks = studyTasks.filter(task => 
                    task.completed && task.id === (editingTask || 'newTask')
  );
  
  // Get linked resources for a task
  const getResourcesForTask = (taskId) => {
    const resourceIds = linkedResources[taskId] || [];
    return resources.filter(resource => resourceIds.includes(resource.id));
  };
  
  // Calculate subtask completion percentage
  const getSubtaskCompletion = (task) => {
    if (task.subtasks || task.subtasks.length === 0) return 0;
    const completedCount = task.subtasks.filter(st => st.completed).length;
    return Math.round((completedCount / task.subtasks.length) * 100);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Smart Study Planner</h1>
            <p className="mt-1 text-white/80">Organize your study sessions, track progress, and manage your academic workload</p>
          </div>
          <button 
            className="btn bg-white text-indigo-600 hover:bg-white/90 shadow-md flex items-center gap-2"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            <span>New Study Task</span>
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="card w-full md:w-1/3 flex-shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1446071103084-c257b5f70672?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc3R1ZHklMjB3b3Jrc3BhY2UlMjBkZXNrJTIwd2l0aCUyMHBsYW50JTIwY29mZmVlJTIwYW5kJTIwbGFwdG9wJTIwcHJvZHVjdGl2aXR5fGVufDB8fHx8MTc0ODM2NTQ2MXww&ixlib=rb-4.1.0&fit=fillmax&h=600&w=800"
            alt="Minimalist workspace with plant"
            className="w-full h-48 object-cover rounded-t-xl"
          />
          <div className="p-4">
            <h2 className="text-lg font-medium">Study Planner Overview</h2>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <span className="text-gray-600 dark:text-gray-300">Total Study Tasks</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{studyTasks.length}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <span className="text-gray-600 dark:text-gray-300">Completed</span>
                <span className="font-medium text-green-600 dark:text-green-400">{studyTasks.filter(t => t.completed).length}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <span className="text-gray-600 dark:text-gray-300">Backlog Items</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">{studyTasks.filter(t => t.isBacklog).length}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                <span className="text-gray-600 dark:text-gray-300">High Priority</span>
                <span className="font-medium text-red-600 dark:text-red-400">{studyTasks.filter(t => t.priority === 'high' && t.completed).length}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <span className="text-gray-600 dark:text-gray-300">Recurring Tasks</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">{studyTasks.filter(t => t.isRecurring).length}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Subjects</h3>
              {Object.entries(studyTasks.reduce((acc, task) => {
                acc[task.subject] = (acc[task.subject] || 0) + 1;
                return acc;
              }, {}))
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([subject, count], index) => (
                  <div key={subject} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 mb-2">
                    <span className="text-gray-600 dark:text-gray-300">{subject}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 dark:text-gray-300">{count} tasks</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-2/3 space-y-6">
          {showForm && (
            <div className="card border-2 border-blue-100 dark:border-blue-900/30 shadow-lg">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-blue-500" />
                {editingTask ? 'Edit Study Task' : 'Add Study Task'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Name</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      placeholder="Read Chapter 5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      placeholder="Mathematics"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline (optional)</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time (optional)</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      placeholder="Additional notes or details..."
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtasks</label>
                    <div className="space-y-2">
                      {subtasks.map((subtask, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={subtask.title}
                            disabled
                            className="input flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeSubtask(index)}
                            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          placeholder="Add subtask..."
                          className="input flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                        <button
                          type="button"
                          onClick={addSubtask}
                          className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={isRecurring}
                      onChange={() => setIsRecurring(isRecurring)}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">Recurring Task</label>
                  </div>
                  
                  {isRecurring && (
                    <div className="ml-6 mt-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repeat on days</label>
                      <div className="flex flex-wrap gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleRecurringDay(index)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              recurringDays.includes(index)
                                ? 'bg-blue-500 text-white dark:bg-blue-600'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="isBacklog"
                      checked={isBacklog}
                      onChange={() => setIsBacklog(isBacklog)}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label htmlFor="isBacklog" className="text-sm font-medium text-gray-700 dark:text-gray-300">Add to Backlog</label>
                  </div>
                  
                  {availableDependencyTasks.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dependencies (tasks that must be completed first)</label>
                      <div className="ml-1 mt-1 space-y-1 max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                        {availableDependencyTasks.map(task => (
                          <div key={task.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`dep-${task.id}`}
                              checked={dependsOn.includes(task.id)}
                              onChange={() => handleDependencyChange(task.id)}
                              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <label htmlFor={`dep-${task.id}`} className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {task.title}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline dark:border-gray-600 dark:text-gray-300"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTask ? 'Update Task' : 'Save Task'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-outline dark:border-gray-600 dark:text-gray-300'}`}
              onClick={() => setViewMode('all')}
            >
              All Tasks
            </button>
            <button
              className={`btn ${viewMode === 'plan' ? 'btn-primary' : 'btn-outline dark:border-gray-600 dark:text-gray-300'}`}
              onClick={() => setViewMode('plan')}
            >
              Study Plan
            </button>
            <button
              className={`btn ${viewMode === 'backlog' ? 'btn-primary' : 'btn-outline dark:border-gray-600 dark:text-gray-300'}`}
              onClick={() => setViewMode('backlog')}
            >
              Backlog
            </button>
            
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded p-1"
              >
                <option value="priority">Priority</option>
                <option value="deadline">Deadline</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>
          
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                {viewMode === 'all' ? (
                  <><FileText size={20} className="text-blue-500" /> All Study Tasks</>
                ) : viewMode === 'backlog' ? (
                  <><ArrowDown size={20} className="text-amber-500" /> Backlog Items</>
                ) : (
                  <><Calendar size={20} className="text-indigo-500" /> Weekly Study Plan</>
                )}
              </h2>
            </div>
            
                          {viewMode === 'plan' ? (
              <div className="space-y-3">
                {sortedStudyTasks.length > 0 ? (
                  sortedStudyTasks.map((task) => (
                    <div 
                      key={task.id}
                      className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                        task.completed 
                          ? 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600' 
                          : task.isBacklog 
                          ? 'bg-amber-50 border-amber-400 dark:bg-amber-900/20 dark:border-amber-600' 
                          : task.priority === 'high'
                          ? 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-600'
                          : task.priority === 'medium'
                          ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-600'
                          : 'bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleComplete(task.id)}
                            disabled={canCompleteTask(task)}
                            className={`mt-0.5 p-1 rounded-full ${
                              canCompleteTask(task) && task.completed
                                ? 'text-gray-300 cursor-not-allowed dark:text-gray-600'
                                : task.completed
                                ? 'text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                                : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 dark:hover:text-green-400'
                            }`}
                          >
                            {task.completed ? (
                              <CheckCircle size={20} />
                            ) : (
                              <Clock size={20} />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'dark:text-gray-100'}`}>
                                {task.title}
                              </h3>
                              {task.isRecurring && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full dark:bg-purple-900/30 dark:text-purple-300">
                                  Recurring
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{task.subject}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1 dark:bg-gray-700 dark:text-gray-300">
                                <Clock size={12} />
                                {task.duration} min
                              </span>
                              {task.deadline && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1 dark:bg-blue-900/30 dark:text-blue-300">
                                  <Calendar size={12} />
                                  {new Date(task.deadline).toLocaleDateString()}
                                </span>
                              )}
                              {task.time && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1 dark:bg-blue-900/30 dark:text-blue-300">
                                  <Clock size={12} />
                                  {task.time}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1
                                ${task.priority === 'high' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                }`}>
                                <AlertTriangle size={12} />
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full
                                ${task.difficulty === 'hard' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                  : task.difficulty === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                }`}>
                                {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                              </span>
                            </div>
                            
                            {task.notes && (
                              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                                {task.notes}
                              </div>
                            )}
                            
                            {/* Subtasks */}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="mt-2">
                                <button 
                                  onClick={() => toggleShowSubtasks(task.id)}
                                  className="text-xs text-blue-600 flex items-center gap-1 hover:underline dark:text-blue-400"
                                >
                                  <CheckSquare size={12} />
                                  <span>
                                    {showSubtasks[task.id] ? 'Hide' : 'Show'} subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})
                                  </span>
                                </button>
                                
                                {showSubtasks[task.id] && (
                                  <div className="mt-2 pl-4 border-l-2 border-blue-100 space-y-2 dark:border-blue-900">
                                    {task.subtasks.map(subtask => (
                                      <div key={subtask.id} className="flex items-center gap-2">
                                        <button
                                          onClick={() => toggleSubtaskCompletion(task.id, subtask.id)}
                                          className={`p-1 rounded-full ${
                                            subtask.completed 
                                              ? 'text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                                              : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 dark:hover:text-green-400'
                                          }`}
                                        >
                                          {subtask.completed ? <CheckCircle size={14} /> : <Clock size={14} />}
                                        </button>
                                        <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'dark:text-gray-300'}`}>
                                          {subtask.title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {task.dependsOn && task.dependsOn.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-500 flex items-center gap-1 dark:text-gray-400">
                                  <Link size={12} />
                                  <span>Depends on:</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {task.dependsOn.map(depId => {
                                    const depTask = studyTasks.find(t => t.id === depId);
                                    if (depTask) return null;
                                    return (
                                      <span 
                                        key={depId}
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                          depTask.completed 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                      >
                                        {depTask.title}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {/* Linked Resources */}
                            {linkedResources[task.id] && linkedResources[task.id].length > 0 && (
                              <div className="mt-2">
                                <button 
                                  onClick={() => toggleShowLinkedResources(task.id)}
                                  className="text-xs text-blue-600 flex items-center gap-1 hover:underline dark:text-blue-400"
                                >
                                  <FileText size={12} />
                                  <span>
                                    {showLinkedResources[task.id] ? 'Hide' : 'Show'} {linkedResources[task.id].length} linked resources
                                  </span>
                                </button>
                                
                                {showLinkedResources[task.id] && (
                                  <div className="mt-1 space-y-1 pl-4 border-l-2 border-blue-100 dark:border-blue-900">
                                    {getResourcesForTask(task.id).map(resource => (
                                      <div key={resource.id} className="text-xs flex items-center gap-1">
                                        <FileText size={10} className="text-blue-500 dark:text-blue-400" />
                                        <span className="text-gray-700 dark:text-gray-300">{resource.title}</span>
                                        <button
                                          onClick={() => unlinkResourceFromTask(task.id, resource.id)}
                                          className="ml-auto text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                          title="Unlink resource"
                                        >
                                          <Trash size={10} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => startPomodoro(task.id, task.title)}
                            className="p-1 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                            title="Start Pomodoro for this task"
                          >
                            <Play size={18} />
                          </button>
                          
                          <button
                            onClick={() => editTask(task)}
                            className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                            title="Edit task"
                          >
                            <Edit size={18} />
                          </button>
                          
                          {viewMode === 'backlog' && task.isRecurring && (
                            <button
                              onClick={() => handleToggleBacklog(task.id)}
                              className="p-1 rounded-full text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-900/20"
                              title={task.isBacklog ? "Move to active tasks" : "Move to backlog"}
                            >
                              {task.isBacklog ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                            title="Delete task"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                      
                      {task.subtasks && task.subtasks.length > 0 && showSubtasks[task.id] && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                            <div
                              className="bg-green-500 h-1.5 rounded-full dark:bg-green-600"
                              style={{ width: `${getSubtaskCompletion(task)}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks completed
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <BookOpen size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>No study tasks found. Create your first study task to get started</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {studyPlan.map((day, index) => (
                  <div key={day.date} className="border rounded-lg overflow-hidden shadow-sm dark:border-gray-700">
                    <div className={`p-3 font-medium ${index === 0 ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {day.formattedDate} {index === 0 && '(Today)'}
                    </div>
                    {day.tasks.length > 0 ? (
                      <div className="divide-y dark:divide-gray-700">
                        {day.tasks.map(task => (
                          <div key={task.id} className="p-3 flex items-start justify-between hover:bg-gray-50 transition-colors dark:hover:bg-gray-800">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleToggleComplete(task.id)}
                                disabled={canCompleteTask(task)}
                                className={`mt-0.5 p-1 rounded-full ${
                                  canCompleteTask(task) && task.completed
                                    ? 'text-gray-300 cursor-not-allowed dark:text-gray-600'
                                    : task.completed
                                    ? 'text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                                    : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 dark:hover:text-green-400'
                                }`}
                              >
                                {task.completed ? (
                                  <CheckCircle size={20} />
                                ) : (
                                  <Clock size={20} />
                                )}
                              </button>
                              <div>
                                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'dark:text-gray-200'}`}>
                                  {task.title}
                                </h3>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">{task.subject}</span>
                                  <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400">{task.duration} min</span>
                                  {task.time && (
                                    <>
                                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                      <span className="text-xs text-blue-600 dark:text-blue-400">{task.time}</span>
                                    </>
                                  )}
                                  {task.isRecurring && (
                                    <>
                                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                      <span className="text-xs text-purple-600 dark:text-purple-400">Recurring</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`px-2 py-1 text-xs rounded-full
                                ${task.priority === 'high' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                }`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </div>
                              <button
                                onClick={() => startPomodoro(task.id, task.title)}
                                className="p-1 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                title="Start Pomodoro for this task"
                              >
                                <Play size={16} />
                              </button>
                              <button
                                onClick={() => editTask(task)}
                                className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                                title="Edit task"
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                        <p>No tasks scheduled for this day.</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {studyTasks.filter(t => t.completed && t.isBacklog).length === 0 && (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg dark:bg-gray-800 dark:text-gray-400">
                    <AlertTriangle size={32} className="mx-auto mb-2 text-yellow-500" />
                    <p>Your study plan is empty. Add some tasks to generate a personalized study plan.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-start gap-4">
          <img 
            src="https://images.unsplash.com/photo-1446071103084-c257b5f70672?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc3R1ZHklMjB3b3Jrc3BhY2UlMjBkZXNrJTIwd2l0aCUyMHBsYW50JTIwY29mZmVlJTIwYW5kJTIwbGFwdG9wJTIwcHJvZHVjdGl2aXR5fGVufDB8fHx8MTc0ODM2NTQ2MXww&ixlib=rb-4.1.0&fit=fillmax&h=600&w=800"
            alt="Minimalist workspace with plant"
            className="w-24 h-24 object-cover rounded-lg hidden md:block"
          />
          <div>
            <h2 className="text-lg font-medium mb-2 dark:text-white">Smart Study Planner Features</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <ChevronRight size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-200">Task Dependencies</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Link tasks together to ensure they're completed in the right order.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-200">Adaptive Study Plan</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatically generates a daily/weekly plan based on your tasks.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-200">Backlog Manager</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Move less urgent tasks to backlog and focus on what matters now.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-200">Integrated Pomodoro</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start focused study sessions directly from your tasks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
 