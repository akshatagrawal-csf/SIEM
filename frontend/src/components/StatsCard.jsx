import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, change, changeLabel, color = '#3B82F6' }) => {
  const hasChange = change !== undefined && change !== null;
  const isPositiveChange = hasChange && Number(change) >= 0;
  
  return (
    <div className="glass-panel p-5 rounded-lg border border-siem-border bg-siem-card">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1 pr-1">
          <p className="text-siem-muted text-[11px] font-mono font-medium uppercase tracking-wider truncate" title={title}>
            {title}
          </p>
          <h3 className="font-bold text-white mt-1.5 tracking-tight break-all truncate text-lg sm:text-xl lg:text-2xl" title={value}>
            {value}
          </h3>
          {hasChange && (
            <div className="flex items-center gap-1 mt-1 text-[11px] font-mono">
              {isPositiveChange ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <TrendingUp size={14} /> +{Math.abs(Number(change))}%
                </span>
              ) : (
                <span className="text-red-400 font-semibold flex items-center gap-1">
                  <TrendingDown size={14} /> -{Math.abs(Number(change))}%
                </span>
              )}
              {changeLabel && <span className="text-siem-muted ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>

        {Icon && (
          <div className="p-2.5 rounded-md bg-siem-secondary border border-siem-border shrink-0">
            <Icon size={20} style={{ color }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
