import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-200">
      <div className="w-16 h-16 bg-lavender-50 text-violet-500 rounded-full flex items-center justify-center mb-4">
        {Icon && <Icon size={32} />}
      </div>
      <h3 className="text-lg font-semibold text-plum-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
