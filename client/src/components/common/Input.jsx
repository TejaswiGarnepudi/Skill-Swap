import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  icon: Icon,
  variant = 'default',
  isTextarea = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = `w-full rounded-xl border transition-all duration-200 outline-none focus:ring-2 ${
    Icon ? 'pl-10 pr-4' : 'px-4'
  } py-2.5 ${
    error
      ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
      : 'border-gray-200 focus:ring-violet-200 focus:border-violet-500'
  }`;

  const variantClasses = variant === 'filled' ? 'bg-lavender-50' : 'bg-white';
  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

  const Component = isTextarea ? 'textarea' : 'input';

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-plum-900">{label}</label>}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <Component ref={ref} className={combinedClasses} {...props} />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
