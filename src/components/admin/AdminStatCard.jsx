import React from 'react';

const AdminStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'emerald',
  loading = false 
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30',
      text: 'text-emerald-600',
      border: 'border-emerald-100'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30',
      text: 'text-blue-600',
      border: 'border-blue-100'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30',
      text: 'text-amber-600',
      border: 'border-amber-100'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30',
      text: 'text-red-600',
      border: 'border-red-100'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/30',
      text: 'text-purple-600',
      border: 'border-purple-100'
    },
    slate: {
      bg: 'bg-slate-50',
      icon: 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-500/30',
      text: 'text-slate-600',
      border: 'border-slate-100'
    }
  };

  const styles = colorStyles[color] || colorStyles.emerald;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
          </div>
          <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-5 border ${styles.border} hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className={`text-2xl lg:text-3xl font-bold ${styles.text}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'
            }`}>
              {trend === 'up' && <span>+</span>}
              {trend === 'down' && <span>-</span>}
              <span>{trendValue}</span>
              <span className="text-slate-400 ml-1">vs last week</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${styles.icon} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="text-xl" />
        </div>
      </div>
    </div>
  );
};

export default AdminStatCard;
