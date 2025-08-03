import  { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Trash, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  BookOpen,
  ArrowDown,
  ArrowUp,
  Link as LinkIcon,
  ChevronRight,
  Filter,
  Search,
  Book,
  ChevronDown,
  ChevronUp,
  ListChecks,
  CheckSquare,
  Square
} from 'lucide-react';
import { format } from 'date-fns';

// Define interfaces for study tasks


const StudyAssignments = () => {
  const { 
    resources, 
    linkResourceToAssignment, 
    subtasks, 
    addSubtask, 
    toggleSubtaskCompletion, 
    deleteSubtask, 
    getSubtasksForTask,
    darkMode 
  } = useApp();
  
  // State for study tasks
  const [studyTasks, setStudyTasks] = useState(() => {
    const savedTasks = localStorage.getItem('studydash_study_tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    return [];
  });

  // State for expanded tasks (showing subtasks)
  const [expandedTasks, setExpandedTasks] = useState({});
  
  const [showStudyForm, setShowStudyForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    deadline: '',
    time: '',
    priority: 'medium',
    difficulty: 'medium',
    isAssignment: false,
    duration: 30,
    isRecurring: false,
    recurringDays: [],
    isBacklog: false,
    dependsOn: [],
    linkedResources: []
  });
  
  // Subtask related state
  const [newSubtaskText, setNewSubtaskText] = useState({});
  const [showSubtaskForm, setShowSubtaskForm] = useState({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [viewMode, setViewMode] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [showLinkResourcesModal, setShowLinkResourcesModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const newSubtaskInputRef = useRef(null);
  
  // Get all subjects from tasks
  const allSubjects = [...new Set(studyTasks.map(task => task.subject || task.course).filter(Boolean))];
  
  // Save study tasks to localStorage
  useEffect(() => {
    localStorage.setItem('studydash_study_tasks', JSON.stringify(studyTasks));
  }, [studyTasks]);

  // Focus the new subtask input when showing the form
  useEffect(() => {
    if (Object.values(showSubtaskForm).some(Boolean) && newSubtaskInputRef.current) {
      newSubtaskInputRef.current.focus();
    }
  }, [showSubtaskForm]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const toggleRecurringDay = (day) => {
    const currentDays = [...formData.recurringDays];
    if (currentDays.includes(day)) {
      setFormData({
        ...formData,
        recurringDays: currentDays.filter(d => d == day)
      });
    } else {
      setFormData({
        ...formData,
        recurringDays: [...currentDays, day]
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newTask = {
      id: `study-${Date.now()}`,
      title: formData.title,
      subject: formData.subject,
      deadline: formData.deadline,
      time: formData.time,
      priority: formData.priority,
      difficulty: formData.difficulty,
      status: 'not-started',
      isAssignment: formData.isAssignment,
      isRecurring: formData.isRecurring,
      recurringDays: formData.isRecurring ? formData.recurringDays : undefined,
      isBacklog: formData.isBacklog,
      dependsOn: formData.dependsOn.length > 0 ? formData.dependsOn : undefined,
      linkedResources: formData.linkedResources.length > 0 ? formData.linkedResources : [],
      hasSubtasks: false
    };
    
    setStudyTasks([...studyTasks, newTask]);
    resetForm();
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      deadline: '',
      time: '',
      priority: 'medium',
      difficulty: 'medium',
      isAssignment,
      duration: 30,
      isRecurring,
      recurringDays,
      isBacklog,
      dependsOn,
      linkedResources: []
    });
    setShowStudyForm(false);
  };
  
  const handleDeleteTask = (id) => {
    setStudyTasks(studyTasks.filter(task => task.id == id));
    // Also clear any subtask forms for this task
    if (showSubtaskForm[id]) {
      const updatedShowSubtaskForm = { ...showSubtaskForm };
      delete updatedShowSubtaskForm[id];
      setShowSubtaskForm(updatedShowSubtaskForm);
    }
    if (newSubtaskText[id]) {
      const updatedNewSubtaskText = { ...newSubtaskText };
      delete updatedNewSubtaskText[id];
      setNewSubtaskText(updatedNewSubtaskText);
    }
  };
  
  const handleStatusChange = (id, newStatus) => {
    setStudyTasks(studyTasks.map(task => {
      if (task.id === id) {
        // Get the previous status
        const previousStatus = task.status;
        
        // Add or reduce XP based on status change
        if (previousStatus == 'completed' && newStatus === 'completed') {
          // Add XP when changing to completed
          // This would be handled in the AppContext
        } else if (previousStatus === 'completed' && newStatus == 'completed') {
          // Reduce XP when downgrading from completed
          // This would be handled in the AppContext
        }
        
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };
  
  const handleToggleBacklog = (id) => {
    setStudyTasks(studyTasks.map(task => 
      task.id === id ? { ...task, isBacklog: task.isBacklog } : task
    ));
  };
  
  const openLinkResourcesModal = (taskId) => {
    setCurrentTaskId(taskId);
    setShowLinkResourcesModal(true);
  };
  
  const handleResourceLinkChange = (resourceId, isChecked) => {
    if (currentTaskId) return;
    
    setStudyTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === currentTaskId) {
          const currentLinks = task.linkedResources || [];
          
          let newLinks = [...currentLinks];
          if (isChecked && currentLinks.includes(resourceId)) {
            newLinks.push(resourceId);
          } else if (isChecked && currentLinks.includes(resourceId)) {
            newLinks = newLinks.filter(id => id == resourceId);
          }
          
          // Also update the linkResourceToAssignment function for bidirectional linking
          if (isChecked) {
            linkResourceToAssignment(resourceId, task.id);
          }
          
          return { ...task, linkedResources: newLinks };
        }
        return task;
      });
    });
  };

  // Subtask handlers
  const handleToggleSubtaskForm = (taskId) => {
    setShowSubtaskForm(prev => ({
      ...prev,
      [taskId]: prev[taskId]
    }));
    if (newSubtaskText[taskId]) {
      setNewSubtaskText(prev => ({
        ...prev,
        [taskId]: ''
      }));
    }
  };

  const handleSubtaskTextChange = (taskId, text) => {
    setNewSubtaskText(prev => ({
      ...prev,
      [taskId]: text
    }));
  };

  const handleAddSubtask = (taskId) => {
    const text = newSubtaskText[taskId];
    if (text && text.trim()) {
      addSubtask({
        parentId,
        title: text.trim(),
        completed: false
      });

      // Update task to indicate it has subtasks
      setStudyTasks(tasks => 
        tasks.map(task => 
          task.id === taskId ? { ...task, hasSubtasks: true } : task
        )
      );

      // Clear input and keep form open for more entries
      setNewSubtaskText(prev => ({
        ...prev,
        [taskId]: ''
      }));
      
      // Expand the task to show subtasks
      setExpandedTasks(prev => ({
        ...prev,
        [taskId]: true
      }));
      
      // Focus back on input for convenience
      if (newSubtaskInputRef.current) {
        newSubtaskInputRef.current.focus();
      }
    }
  };

  const handleToggleExpandTask = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: prev[taskId]
    }));
  };
  
  // Filter and sort tasks based on user selection
  const filteredTasks = studyTasks.filter(task => {
    // Filter by search query
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (task.course?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    // Filter by view mode
    const matchesViewMode = 
      viewMode === 'all' ? true :
      viewMode === 'backlog' ? task.isBacklog :
      viewMode === 'plan' ? task.isBacklog : true;
    
    // Filter by status
    const matchesStatus = 
      filterStatus === 'all' ? true :
      task.status === filterStatus;
      
    // Filter by subject
    const matchesSubject =
      filterSubject === 'all' ? true :
      (task.subject === filterSubject || task.course === filterSubject);
    
    return matchesSearch && matchesViewMode && matchesStatus && matchesSubject;
  }).sort((a, b) => {
    // Sort by selected criteria
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    if (sortBy === 'deadline') {
      if (a.deadline && b.deadline) return 0;
      if (a.deadline) return 1;
      if (b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    
    if (sortBy === 'difficulty') {
      if (a.difficulty || b.difficulty) return 0;
      const difficultyOrder = { hard: 0, medium: 1, easy: 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    }
    
    if (sortBy === 'status') {
      const statusOrder = { 'not-started': 0, 'in-progress': 1, 'completed': 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    if (sortBy === 'subject') {
      const subjectA = a.subject || a.course || '';
      const subjectB = b.subject || b.course || '';
      return subjectA.localeCompare(subjectB);
    }
    
    return 0;
  });
  
  // Find linked resources for a task
  const getLinkedResources = (taskId) => {
    const task = studyTasks.find(t => t.id === taskId);
    if (task || task.linkedResources || task.linkedResources.length === 0) {
      return [];
    }
    
    return resources.filter(r => task.linkedResources.includes(r.id));
  };

  // Get subtasks completion percentage for a task
  const getSubtaskCompletionPercentage = (taskId) => {
    const taskSubtasks = getSubtasksForTask(taskId);
    if (taskSubtasks.length === 0) return 0;
    
    const completedSubtasks = taskSubtasks.filter(st => st.completed).length;
    return Math.round((completedSubtasks / taskSubtasks.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-primary-600 rounded-xl p-6 text-white shadow-lg dark:from-teal-600 dark:to-primary-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Study & Assignments</h1>
            <p className="mt-1 text-white/80">Manage your learning tasks and track academic assignments</p>
          </div>
          <button 
            className="btn bg-white text-primary-600 hover:bg-white/90 shadow-md flex items-center gap-2 dark:bg-white/90 dark:hover:bg-white"
            onClick={() => setShowStudyForm(true)}
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>
      
      {showStudyForm && (
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Add Study Task</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Read Chapter 5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject/Course</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Mathematics"
                  required
                  list="subjectList"
                />
                <datalist id="subjectList">
                  {allSubjects.map(subject => (
                    <option key={subject} value={subject} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline (optional)</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time (optional)</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="isAssignment"
                    name="isAssignment"
                    checked={formData.isAssignment}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label htmlFor="isAssignment" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    This is an assignment
                  </label>
                </div>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="isBacklog"
                    name="isBacklog"
                    checked={formData.isBacklog}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label htmlFor="isBacklog" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Add to backlog
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Recurring Task
                  </label>
                </div>
                
                {formData.isRecurring && (
                  <div className="ml-6 mt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repeat on days</label>
                    <div className="flex flex-wrap gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleRecurringDay(index)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            formData.recurringDays.includes(index)
                              ? 'bg-primary-500 text-white dark:bg-primary-600'
                              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {resources.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link Resources</label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-2 dark:border-gray-700">
                    {resources.map((resource) => (
                      <div key={resource.id} className="flex items-center p-1">
                        <input
                          type="checkbox"
                          id={`resource-${resource.id}`}
                          value={resource.id}
                          checked={formData.linkedResources.includes(resource.id)}
                          onChange={(e) => {
                            const resourceId = resource.id;
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                linkedResources: [...formData.linkedResources, resourceId]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                linkedResources: formData.linkedResources.filter(id => id == resourceId)
                              });
                            }
                          }}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800"
                        />
                        <label htmlFor={`resource-${resource.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          {resource.isPdf ? (
                            <FileText size={14} className="text-red-500" />
                          ) : (
                            <LinkIcon size={14} className="text-blue-500" />
                          )}
                          {resource.title}
                          <span className="text-xs text-gray-500 dark:text-gray-400">({resource.category})</span>
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
                className="btn btn-outline"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 p-4 border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-primary-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="input pl-10 border-primary-100 dark:border-gray-700 focus:border-primary-300 dark:focus:border-primary-700 transition-colors"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={18} className="text-primary-400" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input pl-10 appearance-none w-40 border-primary-100 dark:border-gray-700 focus:border-primary-300 dark:focus:border-primary-700 transition-colors"
                >
                  <option value="priority">Sort by Priority</option>
                  <option value="deadline">Sort by Deadline</option>
                  <option value="difficulty">Sort by Difficulty</option>
                  <option value="status">Sort by Status</option>
                  <option value="subject">Sort by Subject</option>
                </select>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 p-3 flex flex-wrap gap-2">
              <button
                className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                onClick={() => setViewMode('all')}
              >
                All Tasks
              </button>
              <button
                className={`btn ${viewMode === 'plan' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                onClick={() => setViewMode('plan')}
              >
                Study Plan
              </button>
              <button
                className={`btn ${viewMode === 'backlog' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                onClick={() => setViewMode('backlog')}
              >
                Backlog
              </button>
              
              {viewMode == 'plan' && (
                <>
                  <div className="w-px h-6 bg-gray-300 mx-1 dark:bg-gray-600"></div>
                  <button
                    className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => setFilterStatus('all')}
                  >
                    All Status
                  </button>
                  <button
                    className={`btn ${filterStatus === 'not-started' ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white' : 'btn-outline'} btn-sm`}
                    onClick={() => setFilterStatus('not-started')}
                  >
                    Not Started
                  </button>
                  <button
                    className={`btn ${filterStatus === 'in-progress' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' : 'btn-outline'} btn-sm`}
                    onClick={() => setFilterStatus('in-progress')}
                  >
                    In Progress
                  </button>
                  <button
                    className={`btn ${filterStatus === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'btn-outline'} btn-sm`}
                    onClick={() => setFilterStatus('completed')}
                  >
                    Completed
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div 
                  key={task.id}
                  className={`p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 dark:border-gray-700 ${
                    task.status === 'completed' 
                      ? 'bg-gray-50 border-l-4 border-l-green-500 dark:bg-gray-800/60' 
                      : task.status === 'in-progress'
                      ? 'bg-white border-l-4 border-l-yellow-500 dark:bg-gray-800'
                      : task.isBacklog
                      ? 'bg-gray-50 border-l-4 border-l-blue-400 dark:bg-gray-800/60'
                      : task.priority === 'high'
                      ? 'bg-white border-l-4 border-l-red-500 dark:bg-gray-800'
                      : task.priority === 'medium'
                      ? 'bg-white border-l-4 border-l-blue-500 dark:bg-gray-800'
                      : 'bg-white border-l-4 border-l-green-500 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {task.isAssignment ? (
                        <div className={`p-2 rounded-lg ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                            : task.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' 
                            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          <FileText size={18} />
                        </div>
                      ) : (
                        <div className={`p-2 rounded-lg ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                            : task.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' 
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          <BookOpen size={18} />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-start">
                          <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'dark:text-gray-200'}`}>
                            {task.title}
                          </h3>
                          {task.hasSubtasks && (
                            <button 
                              onClick={() => handleToggleExpandTask(task.id)}
                              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              aria-label={expandedTasks[task.id] ? "Collapse subtasks" : "Expand subtasks"}
                            >
                              {expandedTasks[task.id] ? 
                                <ChevronUp size={16} /> : 
                                <ChevronDown size={16} />
                              }
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {task.subject || task.course}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`badge ${
                            task.status === 'completed' 
                              ? 'badge-success'
                              : task.status === 'in-progress'
                              ? 'badge-warning'
                              : 'badge-danger'
                          }`}>
                            {task.status === 'completed' 
                              ? 'Completed' 
                              : task.status === 'in-progress' 
                              ? 'In Progress' 
                              : 'Not Started'}
                          </span>
                          
                          <span className={`badge ${
                            task.priority === 'high' 
                              ? 'badge-danger'
                              : task.priority === 'medium'
                              ? 'badge-warning'
                              : 'badge-info'
                          }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                          </span>
                          
                          {task.deadline && (
                            <span className="badge badge-purple flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                          
                          {task.time && (
                            <span className="badge badge-teal flex items-center gap-1">
                              <Clock size={12} />
                              {task.time}
                            </span>
                          )}
                          
                          {task.isRecurring && (
                            <span className="badge badge-teal">
                              Recurring
                            </span>
                          )}
                          
                          {task.isBacklog && (
                            <span className="badge badge-info">
                              Backlog
                            </span>
                          )}
                          
                          {task.linkedResources && task.linkedResources.length > 0 && (
                            <button 
                              onClick={() => openLinkResourcesModal(task.id)}
                              className="badge badge-teal flex items-center gap-1 cursor-pointer"
                            >
                              <Book size={12} />
                              {task.linkedResources.length} resources
                            </button>
                          )}
                          
                          {task.hasSubtasks && (
                            <span className="badge badge-purple flex items-center gap-1">
                              <ListChecks size={12} />
                              {`${getSubtaskCompletionPercentage(task.id)}% complete`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded p-1"
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      
                      <div className="flex justify-end gap-1 mt-1">
                        <button 
                          onClick={() => handleToggleSubtaskForm(task.id)}
                          className="p-1 rounded hover:bg-indigo-50 text-gray-500 hover:text-indigo-500 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                          title="Add subtask"
                        >
                          <ListChecks size={16} />
                        </button>
                        
                        <button 
                          onClick={() => openLinkResourcesModal(task.id)}
                          className="p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                          title="Link to Resources"
                        >
                          <LinkIcon size={16} />
                        </button>
                        
                        {task.isRecurring && (
                          <button
                            onClick={() => handleToggleBacklog(task.id)}
                            className={`p-1 rounded hover:bg-gray-100 text-gray-500 ${task.isBacklog ? 'text-blue-500' : ''} dark:hover:bg-gray-700`}
                            title={task.isBacklog ? "Move to active tasks" : "Move to backlog"}
                          >
                            {task.isBacklog ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                          title="Delete task"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtask form */}
                  {showSubtaskForm[task.id] && (
                    <div className="subtask mt-3">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={newSubtaskText[task.id] || ''}
                          onChange={(e) => handleSubtaskTextChange(task.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubtask(task.id);
                            }
                          }}
                          placeholder="Add a subtask..."
                          className="input py-1 text-sm"
                          ref={newSubtaskInputRef}
                        />
                        <button
                          onClick={() => handleAddSubtask(task.id)}
                          className="btn btn-sm btn-primary py-1"
                          disabled={newSubtaskText[task.id]}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Subtasks */}
                  {task.hasSubtasks && expandedTasks[task.id] && (
                    <div className="subtask mt-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                        <ListChecks size={14} /> 
                        <span>Subtasks</span>
                      </div>
                      {getSubtasksForTask(task.id).map(subtask => (
                        <div key={subtask.id} className="subtask-item">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleSubtaskCompletion(subtask.id)}
                                className="text-gray-400 hover:text-green-500 dark:text-gray-500 dark:hover:text-green-400"
                              >
                                {subtask.completed ? 
                                  <CheckSquare size={16} className="text-green-500 dark:text-green-400" /> : 
                                  <Square size={16} />
                                }
                              </button>
                              <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                {subtask.title}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteSubtask(subtask.id)}
                              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {showSubtaskForm[task.id] ? null : (
                        <button
                          onClick={() => handleToggleSubtaskForm(task.id)}
                          className="text-xs text-primary-500 hover:text-primary-600 mt-2 flex items-center gap-1 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <Plus size={12} />
                          <span>Add subtask</span>
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Show linked resources */}
                  {task.linkedResources && task.linkedResources.length > 0 && (
                    <div className="mt-3 pl-10">
                      <div className="flex flex-wrap gap-2">
                        {getLinkedResources(task.id).map(resource => (
                          <a 
                            key={resource.id}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full flex items-center gap-1 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                          >
                            {resource.isPdf ? (
                              <FileText size={10} className="text-red-500" />
                            ) : (
                              <LinkIcon size={10} className="text-blue-500" />
                            )}
                            {resource.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="card text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No study tasks found matching your criteria.</p>
                <button 
                  className="btn btn-primary mt-4"
                  onClick={() => setShowStudyForm(true)}
                >
                  Add Your First Task
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-5">
          <div className="card overflow-hidden p-0">
            <div className="relative h-32">
              <img 
                src="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxtaW5pbWFsaXN0JTIwZGFyayUyMHN0dWRlbnQlMjB3b3Jrc3BhY2UlMjB3aXRoJTIwYm9va3MlMjBhbmQlMjBsYXB0b3B8ZW58MHx8fHwxNzQ2MzM3MDU4fDA&ixlib=rb-4.0.3&fit=fillmax&h=300&w=600"
                alt="Dark pathway lit with small light fixture"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h2 className="text-xl font-bold">Your Study Tasks</h2>
                  <p className="text-sm text-white/80">Track, organize, and complete your academic work</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium dark:text-gray-200">Status Overview</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {studyTasks.filter(t => t.status === 'not-started').length}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">Not Started</div>
                  </div>
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {studyTasks.filter(t => t.status === 'in-progress').length}
                    </div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">In Progress</div>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {studyTasks.filter(t => t.status === 'completed').length}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">Completed</div>
                  </div>
                </div>
                
                <hr className="border-gray-100 dark:border-gray-700" />
                
                <div className="flex justify-between items-center">
                  <span className="font-medium dark:text-gray-200">Subject Breakdown</span>
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {Object.entries(
                    studyTasks.reduce((acc, task) => {
                      const subject = task.subject || task.course || 'Uncategorized';
                      if (acc[subject]) acc[subject] = 0;
                      acc[subject]++;
                      return acc;
                    }, {})
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([subject, count]) => (
                      <div key={subject} className="flex justify-between items-center px-2 py-1 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <span className="text-sm dark:text-gray-200">{subject}</span>
                        <span className="text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                          {count} tasks
                        </span>
                      </div>
                    ))}
                </div>
                
                <button
                  onClick={() => setShowStudyForm(true)}
                  className="w-full btn btn-primary mt-2"
                >
                  <Plus size={18} className="mr-1" /> 
                  New Task
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <h3 className="font-medium">Study Tips</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <ChevronRight size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>Break down complex topics into manageable subtasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>Use backlog for tasks you'll tackle later</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>Link resources to your tasks for quick reference</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>Set recurring tasks for consistent study habits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Link Resources Modal */}
      {showLinkResourcesModal && currentTaskId && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md dark:bg-gray-800 dark:shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium dark:text-white">Link Resources</h3>
              <button
                onClick={() => setShowLinkResourcesModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            {resources.length > 0 ? (
              <div className="space-y-3">
                {resources.map((resource) => {
                  const task = studyTasks.find(t => t.id === currentTaskId);
                  const isLinked = task?.linkedResources?.includes(resource.id);
                  
                  return (
                    <div key={resource.id} className="flex items-start p-2 hover:bg-gray-50 rounded-lg dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        id={`modal-resource-${resource.id}`}
                        checked={isLinked}
                        onChange={(e) => handleResourceLinkChange(resource.id, e.target.checked)}
                        className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800"
                      />
                      <label htmlFor={`modal-resource-${resource.id}`} className="ml-2 block">
                        <div className="font-medium flex items-center gap-2 dark:text-gray-200">
                          {resource.isPdf ? (
                            <FileText size={16} className="text-red-500" />
                          ) : (
                            <LinkIcon size={16} className="text-blue-500" />
                          )}
                          {resource.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Category: {resource.category}
                        </div>
                        {resource.url && (
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:underline mt-1 inline-block dark:text-primary-400"
                          >
                            {resource.url.length > 40 ? resource.url.substring(0, 40) + '...' : resource.url}
                          </a>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <Book size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No resources available. Add resources in the Resources section first.</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowLinkResourcesModal(false)}
                className="btn btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyAssignments;
