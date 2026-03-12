import React from 'react';

export const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
      <div 
        className="bg-[#003366] dark:bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  );
};
