import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ placeholder = 'Search...', onChange, className = '' }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-500 sm:text-sm transition-all duration-200"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
