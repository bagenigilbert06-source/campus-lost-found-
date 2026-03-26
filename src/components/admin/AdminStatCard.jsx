const AdminStatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  color = 'blue',
  loading = false,
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    green: 'bg-green-100 text-green-700 ring-1 ring-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
    red: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    purple: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
    indigo: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
  };

  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-600',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse shadow-sm">
        <div className="h-12 w-12 bg-slate-200 rounded-lg mb-4" />
        <div className="h-4 w-20 bg-slate-200 rounded mb-3" />
        <div className="h-8 w-32 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300 group">
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]} group-hover:scale-110 transition-transform`}
      >
        {Icon && <Icon size={24} />}
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>

      {/* Value */}
      <div className="flex items-end justify-between gap-2">
        <h3 className="text-4xl font-bold text-slate-900 tabular-nums">{value}</h3>
        {trend && (
          <div className={`text-sm font-semibold ${trendColor[trend.direction]} flex items-center gap-1`}>
            {trend.direction === 'up' && <span>↑</span>}
            {trend.direction === 'down' && <span>↓</span>}
            {trend.direction === 'neutral' && <span>→</span>}
            <span>{trend.percentage}%</span>
          </div>
        )}
      </div>

      {/* Additional Info */}
      {trend?.label && (
        <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">{trend.label}</p>
      )}
    </div>
  );
};

export default AdminStatCard;
