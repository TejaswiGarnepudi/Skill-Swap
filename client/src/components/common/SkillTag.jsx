import React from 'react';
import { X } from 'lucide-react';

const SkillTag = ({ name, level, variant = 'teach', removable = false, onRemove }) => {
  const isTeach = variant === 'teach';
  const bgClass = isTeach ? 'bg-violet-100' : 'bg-coral-100';
  const textClass = isTeach ? 'text-violet-700' : 'text-coral-700';
  const borderClass = isTeach ? 'border-violet-200' : 'border-coral-200';

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${bgClass} ${textClass} ${borderClass}`}>
      <span>{name}</span>
      {level && (
        <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider bg-white/50`}>
          {level}
        </span>
      )}
      {removable && (
        <button
          type="button"
          onClick={() => onRemove && onRemove(name)}
          className={`ml-2 p-0.5 rounded-full hover:bg-white/50 transition-colors focus:outline-none`}
        >
          <X size={14} />
        </button>
      )}
    </span>
  );
};

export default SkillTag;
