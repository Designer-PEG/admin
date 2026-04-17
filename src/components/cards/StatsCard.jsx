import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsCard = ({ title, value, icon: Icon, trend, trendLabel }) => {
  const isPositive = trend > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-all dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? <FiTrendingUp className="w-3.5 h-3.5" /> : <FiTrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(trend)}%</span>
              {trendLabel && <span className="text-gray-400 font-normal ml-1 dark:text-gray-500">{trendLabel}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 shrink-0 dark:bg-blue-900/30 dark:text-blue-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
