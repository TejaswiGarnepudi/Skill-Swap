import React from 'react';

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const Avatar = ({ src, name, size = 'md', isOnline = false, className = '' }) => {
  const getInitials = (str) => {
    if (!str) return '?';
    return str.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-block ${sizes[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold border-2 border-white shadow-sm">
          {getInitials(name)}
        </div>
      )}
      
      {isOnline && (
        <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white" />
      )}
    </div>
  );
};

export default Avatar;
