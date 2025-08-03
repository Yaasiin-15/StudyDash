import  { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Edit, 
  FileText, 
  Link, 
  MoreHorizontal, 
  Plus, 
  Search,
  Trash,
  Play,
  List,
  CheckSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

const AddTaskForm = ({ onSubmit, courses, resources, initialTask, onCancel }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [course, setCourse] = useState(initialTask?.course || '');
  const [customCourse, setCustomCourse] = useState('');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(initialTask?.time || '');
  const [status, setStatus] = useState(
    initialTask?.status || 'not-started'
  );
  const [description, setDescription] = useState(initialTask?.description || '');
  const [selectedResources, setSelectedResources] = useState(initialTask?.linkedResources || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedCourse = course === 'custom' ? customCourse : course;
    
    onSubmit({
      title,
      course,
      dueDate,
      time,
      status,
      description,
      linkedResources: selectedResources
    });
    
    // Reset form
    setTitle('');
    setCourse('');
    setCustomCourse('');
    setDueDate(format(new Date(), 'yyyy-MM-dd'));
    setTime('');
    setStatus('not-started');
    setDescription('');
    setSelectedResources([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Task Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder="Enter task title"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course/Subject
          </label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="input"
            required
          >
            <option value="">Select a course</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="custom">Add new course</option>
          </select>
          
          {course === 'custom' && (
            <input
              type="text"
              value={customCourse}
              onChange={(e) => setCustomCourse(e.target.value)}
              className="input mt-2"
              placeholder="Enter course name"
              required
            />
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input"
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Time (optional)
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input min-h-[80px]"
          placeholder="Add notes or details about this task"
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Link Resources (optional)
        </label>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-40 overflow-y-auto">
          {resources.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No resources available. Add some in the Resources section.
            </p>
          ) : (
            <div className="space-y-2">
              {resources.map((resource) => (
                <div key={resource.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`resource-${resource.id}`}
                    checked={selectedResources.includes(resource.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedResources([...selectedResources, resource.id]);
                      } else {
                        setSelectedResources(selectedResources.filter(id => id !== resource.id));
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`resource-${resource.id}`} className="text-sm">
                    {resource.title} <span className="text-xs text-gray-500 dark:text-gray-400">({resource.category})</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {initialTask ? 'Update' : 'Add'} Task
        </button>
      </div>
    </form>
  );
};

const StudyManager = () => {
  const navigate = useNavigate();
  const { 
    assignments, 
    addAssignment, 
    updateAssignmentStatus, 
    deleteAssignment,
    resources
  } = useApp();
  
  const [view, setView] = useState('list');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [showSubtasks, setShowSubtasks] = useState({});
  
  // Get unique courses from assignments
  const courses = [...new Set(assignments.map(a => a.course))];
  
  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter(assignment => {
      // Filter by search query
      const matchesSearch = 
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.course.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by status
      const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
      
      // Filter by course
      const matchesCourse = filterCourse === 'all' || assignment.course === filterCourse;
      
      return matchesSearch && matchesStatus && matchesCourse;
    })
    .sort((a, b) => {
      // Sort by due date (closest first)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  
   const handleAddTask = (task) => {
    const newTask = addAssignment(task);
    setIsAddingTask(false);
    
    // Add task to calendar events
    if (newTask && newTask.dueDate) {
      const calendarEvent = {
        id: `task-${newTask.id}`,
        title: newTask.title,
        date: newTask.dueDate,
        time: newTask.time || undefined,
        type: 'task'
      };
      
      // Get existing calendar events
      const savedEvents = localStorage.getItem('studydash_calendar_events');
      const events = savedEvents ? JSON.parse(savedEvents) : [];
      
      // Add new event and save back to localStorage
      events.push(calendarEvent);
      localStorage.setItem('studydash_calendar_events', JSON.stringify(events));
    }
  }; 
  
  const handleEditTask = (task) => {
    setEditingTask(task);
  };
  
  const handleUpdateTask = (task) => {
    if (editingTask) {
      // Update assignment
      updateAssignmentStatus(editingTask.id, task.status, editingTask.status);
      
      // Update other fields directly in the context
      const updatedAssignment = {
        ...task,
        id: editingTask.id
      };
      
      // Find index of the assignment to update
      const index = assignments.findIndex(a => a.id === editingTask.id);
      if (index !== -1) {
        const newAssignments = [...assignments];
        newAssignments[index] = updatedAssignment;
        // Update assignments in context
        // This would require extending the context to add an updateAssignment function
      }
      
      setEditingTask(null);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingTask(null);
    setIsAddingTask(false);
  };
  
  const handleUpdateStatus = (id, newStatus, currentStatus) => {
    updateAssignmentStatus(id, newStatus, currentStatus);
  };
  
  const handleDeleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteAssignment(id);
    }
  };

  const toggleSubtasks = (id) => {
    setShowSubtasks(prev => ({
      ...prev,
      [id]: prev[id]
    }));
  };
  
  const startPomodoroWithTask = (task) => {
    // Save the task ID to session storage
    sessionStorage.setItem('pomodoro_task_id', task.id);
    // Navigate to pomodoro timer
    navigate('/pomodoro');
  };
  
  // Group assignments by due date for planner view
  const assignmentsByDate = {};
  
  filteredAssignments.forEach(assignment => {
    const date = assignment.dueDate;
    if (!assignmentsByDate[date]) {
      assignmentsByDate[date] = [];
    }
    assignmentsByDate[date].push(assignment);
  });

  const sortedDates = Object.keys(assignmentsByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Study Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your study tasks and assignments in one place
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setView('list')}
            className={`btn ${
              view === 'list' 
                ? 'btn-primary' 
                : 'btn-outline'
            }`}
          >
            <List size={18} className="mr-1" />
            List
          </button>
          <button
            onClick={() => setView('planner')}
            className={`btn ${
              view === 'planner' 
                ? 'btn-primary' 
                : 'btn-outline'
            }`}
          >
            <Calendar size={18} className="mr-1" />
            Planner
          </button>
        </div>
      </div>

      {/* Featured image */}
      <div className="relative rounded-xl overflow-hidden mb-6">
        <img 
          src="https://images.unsplash.com/photo-1604882737321-e6937fd6f519?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBwcm9kdWN0aXZpdHklMjBkYXNoYm9hcmR8ZW58MHx8fHwxNzQ4MzY2NTI1fDA&ixlib=rb-4.1.0&fit=fillmax&h=500&w=800" 
          alt="Student studying" 
          className="w-full h-40 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <p className="text-xl font-semibold">Organize your studies</p>
          <p className="text-sm opacity-80">Track assignments, deadlines, and study sessions</p>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input py-1.5"
            >
              <option value="all">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="input py-1.5"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            
            <button
              onClick={() => setIsAddingTask(true)}
              className="btn btn-primary"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Add/Edit task form */}
      {(isAddingTask || editingTask) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6">
          <h2 className="text-lg font-medium mb-4">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <AddTaskForm
            onSubmit={editingTask ? handleUpdateTask : handleAddTask}
            courses={courses}
            resources={resources}
            initialTask={editingTask || undefined}
            onCancel={handleCancelEdit}
          />
        </div>
      )}
      
      {/* List view */}
      {view === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {filteredAssignments.length === 0 ? (
            <div className="p-6 text-center">
              <BookOpen size={40} className="mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No tasks found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || filterStatus !== 'all' || filterCourse !== 'all'
                  ? 'No tasks match your filters'
                  : 'Start by adding your first study task'}
              </p>
              <button
                onClick={() => setIsAddingTask(true)}
                className="btn btn-primary"
              >
                <Plus size={18} className="mr-1" />
                Add Task
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Task</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Course</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAssignments.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                        {/* Show linked resources */}
                        {task.linkedResources && task.linkedResources.length > 0 && (
                          <div className="mt-1 flex items-center">
                            <Link size={14} className="text-primary-500 mr-1" />
                            <span className="text-xs text-primary-600 dark:text-primary-400">
                              {task.linkedResources.length} linked resource{task.linkedResources.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {task.course}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Calendar size={14} className="text-gray-400 mr-1" />
                          <span>
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {task.time && (
                          <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <Clock size={12} className="mr-1" />
                            {task.time}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateStatus(
                            task.id, 
                            e.target.value,
                            task.status
                          )}
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                              : task.status === 'in-progress'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
                              : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                          }`}
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startPomodoroWithTask(task)}
                            className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Start Pomodoro"
                          >
                            <Play size={18} />
                          </button>
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Edit Task"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Delete Task"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Planner view */}
      {view === 'planner' && (
        <div className="space-y-6">
          {sortedDates.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
              <Calendar size={40} className="mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No tasks scheduled</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || filterStatus !== 'all' || filterCourse !== 'all'
                  ? 'No tasks match your filters'
                  : 'Start by adding a task with a due date'}
              </p>
              <button
                onClick={() => setIsAddingTask(true)}
                className="btn btn-primary"
              >
                <Plus size={18} className="mr-1" />
                Add Task
              </button>
            </div>
          ) : (
            sortedDates.map(date => (
              <div key={date} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar size={18} className="text-primary-500 mr-2" />
                    <h3 className="font-medium">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {assignmentsByDate[date].length} task{assignmentsByDate[date].length === 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {assignmentsByDate[date].map(task => (
                    <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div 
                              className={`w-3 h-3 rounded-full mr-2 ${
                                task.status === 'completed'
                                  ? 'bg-green-500'
                                  : task.status === 'in-progress'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                            ></div>
                            <h4 className="font-medium">{task.title}</h4>
                          </div>
                          
                          {task.description && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {task.course}
                            </div>
                            
                            {task.time && (
                              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                <Clock size={12} className="mr-1" />
                                {task.time}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startPomodoroWithTask(task)}
                            className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Start Pomodoro"
                          >
                            <Play size={18} />
                          </button>
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Edit Task"
                          >
                            <Edit size={18} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => toggleSubtasks(task.id)}
                              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                              title="More Options"
                            >
                              <MoreHorizontal size={18} />
                            </button>
                            
                            {showSubtasks[task.id] && (
                              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleUpdateStatus(
                                      task.id, 
                                      'not-started',
                                      task.status
                                    )}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                      task.status === 'not-started' ? 'font-medium text-primary-600 dark:text-primary-400' : ''
                                    }`}
                                  >
                                    Mark as Not Started
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(
                                      task.id, 
                                      'in-progress',
                                      task.status
                                    )}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                      task.status === 'in-progress' ? 'font-medium text-primary-600 dark:text-primary-400' : ''
                                    }`}
                                  >
                                    Mark as In Progress
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(
                                      task.id, 
                                      'completed',
                                      task.status
                                    )}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                      task.status === 'completed' ? 'font-medium text-primary-600 dark:text-primary-400' : ''
                                    }`}
                                  >
                                    Mark as Completed
                                  </button>
                                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudyManager;
 