import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center text-violet-500">
      <Loader2 className="w-10 h-10 animate-spin mb-3" />
      {message && <p className="text-sm font-medium text-plum-700 animate-pulse">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-lavender-50/80 backdrop-blur-sm flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex justify-center">
      {content}
    </div>
  );
};

export default LoadingSpinner;
