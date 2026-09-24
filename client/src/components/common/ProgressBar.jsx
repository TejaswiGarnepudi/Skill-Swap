import React from 'react';

const colorVariants = {
  violet: 'bg-violet-500',
  coral: 'bg-coral-500',
  green: 'bg-green-500',
};

const ProgressBar = ({ percentage, label, color = 'violet' }) => {
  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-plum-900">{label}</span>
          <span className="text-xs font-semibold text-gray-500">{safePercentage}%</span>
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-out ${colorVariants[color]}`}
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
