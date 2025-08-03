import  { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash, Edit, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Assignments = () => {
  const { assignments, addAssignment, updateAssignmentStatus, deleteAssignment } = useApp();
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && course.trim() && dueDate) {
      addAssignment({
        title: title.trim(),
        course: course.trim(),
        dueDate,
        status,
      });
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setCourse('');
    setDueDate('');
    setStatus('not-started');
    setIsAddingAssignment(false);
  };

  const handleStatusChange = (id, newStatus) => {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      updateAssignmentStatus(id, newStatus, assignment.status);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success flex items-center gap-1"><CheckCircle size={12} /> Completed</span>;
      case 'in-progress':
        return <span className="badge badge-warning flex items-center gap-1"><Clock size={12} /> In Progress</span>;
      default:
        return <span className="badge badge-danger flex items-center gap-1"><AlertCircle size={12} /> Not Started</span>;
    }
  };

  const sortedAssignments = [...assignments].sort((a, b) => {
    // Sort by status (not-started, in-progress, completed)
    const statusOrder = { 'not-started': 0, 'in-progress': 1, 'completed': 2 };
    if (statusOrder[a.status] == statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    // Then sort by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setIsAddingAssignment(true)}
        >
          <Plus size={18} />
          <span>New Assignment</span>
        </button>
      </div>

      {isAddingAssignment && (
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Add New Assignment</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Assignment title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="input"
                  placeholder="Course name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-outline"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-primary-500" />
          <h2 className="text-lg font-medium">All Assignments</h2>
        </div>

        {sortedAssignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Title</th>
                  <th className="text-left p-3">Course</th>
                  <th className="text-left p-3">Due Date</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="p-3">{assignment.title}</td>
                    <td className="p-3">{assignment.course}</td>
                    <td className="p-3">{new Date(assignment.dueDate).toLocaleDateString()}</td>
                    <td className="p-3">{getStatusBadge(assignment.status)}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <select
                          value={assignment.status}
                          onChange={(e) => handleStatusChange(assignment.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded p-1"
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          onClick={() => deleteAssignment(assignment.id)}
                          className="text-gray-400 hover:text-red-500"
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText size={40} className="mx-auto mb-4 text-gray-300" />
            <p>No assignments yet. Add your first assignment to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
 