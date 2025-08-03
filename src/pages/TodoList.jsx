import  { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash, CheckSquare, Square, Calendar, Clock } from 'lucide-react';

const TodoList = () => {
  const { tasks, addTask, toggleTaskCompletion, deleteTask } = useApp();
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [filter, setFilter] = useState('all');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask({
        title: newTask.trim(),
        completed: false,
        dueDate: dueDate || undefined,
        time: dueTime || undefined
      });
      setNewTask('');
      setDueDate('');
      setDueTime('');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'active') return task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">To-Do List</h1>
        <p className="text-white/80 mt-1">Manage your tasks and stay organized</p>
      </div>

      <div className="card">
        <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-2 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="input flex-1 border-teal-100 focus:border-teal-200 focus:ring-teal-500 transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input w-full md:w-40 border-teal-100 focus:border-teal-200 focus:ring-teal-500 transition-colors"
            />
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="input w-full md:w-36 border-teal-100 focus:border-teal-200 focus:ring-teal-500 transition-colors"
            />
          </div>
          <button type="submit" className="btn bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all duration-300">
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </form>

        <div className="flex gap-2 mb-4">
          <button
            className={`btn ${filter === 'all' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md' : 'btn-outline'} transition-all duration-300`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`btn ${filter === 'active' ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-md' : 'btn-outline'} transition-all duration-300`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`btn ${filter === 'completed' ? 'bg-gradient-to-r from-secondary-500 to-fuchsia-500 text-white shadow-md' : 'btn-outline'} transition-all duration-300`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        {filteredTasks.length > 0 ? (
          <ul className="space-y-2">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-white rounded-lg border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 flex-1">
                  <button 
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`transition-all duration-300 ${task.completed ? 'text-teal-500 hover:text-teal-700' : 'text-gray-400 hover:text-teal-500'}`}
                  >
                    {task.completed ? (
                      <CheckSquare className="w-6 h-6" />
                    ) : (
                      <Square className="w-6 h-6" />
                    )}
                  </button>
                  <span className={`${task.completed ? 'line-through text-gray-500' : ''} transition-all duration-300`}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {(task.dueDate || task.time) && (
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      {task.dueDate && (
                        <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                          <Calendar size={14} className="mr-1 text-teal-500" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {task.time && (
                        <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                          <Clock size={14} className="mr-1 text-teal-500" />
                          {task.time}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
            {filter === 'all'
              ? 'No tasks yet. Add a task to get started'
              : filter === 'active'
              ? 'No active tasks.'
              : 'No completed tasks.'}
          </div>
        )}
        
        {tasks.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
              <div
                className="bg-gradient-to-r from-teal-400 to-emerald-500 h-1.5 rounded-full"
                style={{ width: `${tasks.filter(t => t.completed).length / tasks.length * 100}%` }}
              ></div>
            </div>
            {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
 