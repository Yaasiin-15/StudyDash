import  {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const XPChart = () => {
  const { darkMode } = useApp();
  
  // Sample data - in a real app, this would come from the context or an API
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = {
    labels,
    datasets: [
      {
        label: 'XP Earned',
        data: [15, 25, 20, 30, 45, 40, 50],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: darkMode ? '#374151' : '#ffffff',
        titleColor: darkMode ? '#e5e7eb' : '#1f2937',
        bodyColor: darkMode ? '#e5e7eb' : '#1f2937',
        borderColor: darkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
        },
      },
      x: {
        grid: {
          display: true,
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
};

export default XPChart;
 