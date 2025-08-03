import  { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash, Flag, Check, AlertCircle, ChevronRight } from 'lucide-react';

const Goals = () => {
  const { goals, addGoal, updateGoalProgress, deleteGoal } = useApp();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [filter, setFilter] = useState('all');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && targetDate) {
      addGoal({
        title: title.trim(),
        targetDate,
      });
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setTargetDate('');
    setIsAddingGoal(false);
  };

  const filteredGoals = goals.filter((goal) => {
    if (filter === 'all') return true;
    if (filter === 'active') return goal.completed;
    if (filter === 'completed') return goal.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setIsAddingGoal(true)}
        >
          <Plus size={18} />
          <span>New Goal</span>
        </button>
      </div>

      {isAddingGoal && (
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Add New Goal</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Describe your goal"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="input"
                  required
                />
              </div>
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
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => (
            <div key={goal.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${goal.completed ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {goal.completed ? <Check size={20} className="text-green-600" /> : <Flag size={20} className="text-blue-600" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{goal.title}</h3>
                    <p className="text-sm text-gray-500">
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                    <div className="mt-3">
                      <div className="flex items-center">
                        <div className="flex-1 mr-4">
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium">{goal.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash size={18} />
                </button>
              </div>
              <div className="mt-4 flex gap-2">
                {[0, 25, 50, 75, 100].map((progress) => (
                  <button
                    key={progress}
                    onClick={() => updateGoalProgress(goal.id, progress)}
                    className={`flex-1 py-1 text-xs rounded ${
                      goal.progress === progress
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {progress}%
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="card col-span-full text-center py-8 text-gray-500">
            <Flag size={40} className="mx-auto mb-4 text-gray-300" />
            <p>No goals found. {filter === 'all' ? 'Add your first goal to get started' : `Try the '${filter === 'active' ? 'Completed' : 'Active'}' filter.`}</p>
          </div>
        )}
      </div>

      <div className="card bg-gray-50">
        <h2 className="text-lg font-medium mb-4">Goal Setting Tips</h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <ChevronRight size={18} className="text-primary-500 mt-0.5" />
            <span><strong>Be Specific:</strong> Define clear, measurable goals rather than vague intentions.</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={18} className="text-primary-500 mt-0.5" />
            <span><strong>Break It Down:</strong> Divide larger goals into smaller, manageable milestones.</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={18} className="text-primary-500 mt-0.5" />
            <span><strong>Set Deadlines:</strong> Time-bound goals create urgency and help with prioritization.</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={18} className="text-primary-500 mt-0.5" />
            <span><strong>Track Progress:</strong> Regularly update your progress to stay motivated.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Goals;
 