import  { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash, Activity, Check, Award } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';

const Habits = () => {
  const { habits, addHabit, toggleHabitCompletion, deleteHabit } = useApp();
  const [newHabit, setNewHabit] = useState('');

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (newHabit.trim()) {
      addHabit({
        title: newHabit.trim(),
      });
      setNewHabit('');
    }
  };

  // Get days of current week
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => {
    const day = addDays(startOfCurrentWeek, i);
    return {
      date,
      dayName: format(day, 'EEE'),
      dayNumber: format(day, 'd'),
      dateString: format(day, 'yyyy-MM-dd'),
      isToday: format(today, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Habit Tracker</h1>
      </div>

      <div className="card">
        <form onSubmit={handleAddHabit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Add a new habit..."
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary flex items-center justify-center gap-2">
            <Plus size={18} />
            <span>Add Habit</span>
          </button>
        </form>

        {habits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 w-1/3">Habit</th>
                  <th className="text-center p-2">Streak</th>
                  {weekDays.map((day) => (
                    <th key={day.dateString} className="text-center p-2">
                      <div className={`flex flex-col items-center ${day.isToday ? 'text-primary-600' : ''}`}>
                        <span className="text-xs">{day.dayName}</span>
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full ${day.isToday ? 'bg-primary-100' : ''}`}>
                          {day.dayNumber}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => (
                  <tr key={habit.id} className="border-t">
                    <td className="p-2">
                      <div className="font-medium">{habit.title}</div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Award size={16} className="text-yellow-500" />
                        <span>{habit.streak}</span>
                      </div>
                    </td>
                    {weekDays.map((day) => {
                      const completed = habit.completedDates.includes(day.dateString);
                      return (
                        <td key={`${habit.id}-${day.dateString}`} className="p-2 text-center">
                          <button
                            onClick={() => day.dateString === format(today, 'yyyy-MM-dd') && toggleHabitCompletion(habit.id)}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center
                              ${completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400'}
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
          <div className="text-center py-8 text-gray-500">
            <Activity size={40} className="mx-auto mb-4 text-gray-300" />
            <p>No habits yet. Add a habit to start tracking</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-medium mb-4">Tips for Building Habits</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Start Small</h3>
            <p className="text-sm text-blue-700">Begin with tiny habits that take less than two minutes to complete.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Be Consistent</h3>
            <p className="text-sm text-green-700">Try to perform your habits at the same time each day.</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-2">Track Progress</h3>
            <p className="text-sm text-purple-700">Use this tracker daily to build a visual record of your progress.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Habits;
 