const ChartContainer = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 overflow-hidden">
      <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-3">{title}</h3>
      <div className="h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
 