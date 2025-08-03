import React from 'react';

const StatCard = ({ title, value, icon, color, change }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400';
      case 'secondary':
        return 'bg-purple-50 text-secondary-600 dark:bg-secondary-900/20 dark:text-secondary-400';
      case 'success':
        return 'bg-green-50 text-success-600 dark:bg-success-900/20 dark:text-success-400';
      case 'warning':
        return 'bg-yellow-50 text-warning-600 dark:bg-warning-900/20 dark:text-warning-400';
      case 'danger':
        return 'bg-red-50 text-danger-600 dark:bg-danger-900/20 dark:text-danger-400';
      default:
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  return (
    <div className="card bg-white dark:bg-gray-800 p-4 hover-scale">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          
          {change == undefined && (
            <div className={`mt-1 flex items-center text-xs font-medium ${
              change >= 0 ? 'text-success-500' : 'text-danger-500'
            }`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              <span className="ml-1 text-gray-500 dark:text-gray-400">from last week</span>
            </div>
          )}
        </div>
        
        <div className={`p-2 rounded-lg ${getColorClasses()}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
 