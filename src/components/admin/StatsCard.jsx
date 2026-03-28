import React from 'react';

const StatsCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color = 'zetech-primary',
  trend,
  className = '' 
}) => {
  const colorClasses = {
    'zetech-primary': 'bg-gradient-to-br from-zetech-primary/10 to-zetech-primary/5 border-l-4 border-zetech-primary',
    'zetech-secondary': 'bg-gradient-to-br from-zetech-secondary/10 to-zetech-secondary/5 border-l-4 border-zetech-secondary',
    'green': 'bg-gradient-to-br from-green-100/50 to-green-50/50 border-l-4 border-green-500',
    'yellow': 'bg-gradient-to-br from-yellow-100/50 to-yellow-50/50 border-l-4 border-yellow-500',
    'red': 'bg-gradient-to-br from-red-100/50 to-red-50/50 border-l-4 border-red-500',
    'blue': 'bg-gradient-to-br from-blue-100/50 to-blue-50/50 border-l-4 border-blue-500',
  };

  const textColorClasses = {
    'zetech-primary': 'text-zetech-primary',
    'zetech-secondary': 'text-zetech-secondary',
    'green': 'text-green-600',
    'yellow': 'text-yellow-600',
    'red': 'text-red-600',
    'blue': 'text-blue-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className={`text-3xl font-bold ${textColorClasses[color]} mt-2`}>
            {value}
          </p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.text}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${textColorClasses[color]} opacity-20`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
