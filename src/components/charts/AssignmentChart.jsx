import  { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const AssignmentChart = () => {
  const { assignments, darkMode } = useApp();
  
  // Count assignments by status
  const completed = assignments.filter(a => a.status === 'completed').length;
  const inProgress = assignments.filter(a => a.status === 'in-progress').length;
  const notStarted = assignments.filter(a => a.status === 'not-started').length;
  
  const data = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [completed, inProgress, notStarted],
        backgroundColor: [
          '#10b981', // success-500
          '#f59e0b', // warning-500
          '#ef4444', // danger-500
        ],
        borderColor: darkMode ? '#1f2937' : '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          color: darkMode ? '#e5e7eb' : '#4b5563',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#ffffff',
        titleColor: darkMode ? '#e5e7eb' : '#1f2937',
        bodyColor: darkMode ? '#e5e7eb' : '#1f2937',
        borderColor: darkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="h-64 flex items-center justify-center">
      {assignments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No assignments yet. Add some to see your progress
        </p>
      ) : (
        <Doughnut data={data} options={options} />
      )}
    </div>
  );
};

export default AssignmentChart;
 