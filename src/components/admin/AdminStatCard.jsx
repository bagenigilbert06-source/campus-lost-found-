const AdminStatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  color = 'blue',
  loading = false,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  };

  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-600',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
        <div className="h-10 w-10 bg-slate-200 rounded-lg mb-4" />
        <div className="h-4 w-20 bg-slate-200 rounded mb-3" />
        <div className="h-8 w-32 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]}`}
      >
        {Icon && <Icon size={24} />}
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>

      {/* Value */}
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        {trend && (
          <div className={`text-sm font-medium ${trendColor[trend.direction]}`}>
            {trend.direction === 'up' && '↑'}
            {trend.direction === 'down' && '↓'}
            {trend.direction === 'neutral' && '→'}
            {trend.percentage}%
          </div>
        )}
      </div>

      {/* Additional Info */}
      {trend?.label && (
        <p className="text-xs text-slate-500 mt-3">{trend.label}</p>
      )}
    </div>
  );
};

export default AdminStatCard;
