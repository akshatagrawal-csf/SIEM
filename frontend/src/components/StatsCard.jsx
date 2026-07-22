import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, change, changeLabel, color }) => {
  const hasChange = change !== undefined && change !== null;
  const isPositiveChange = hasChange && Number(change) >= 0;
  
  return (
    <div className="stat-card glass-card">
      <div className="stat-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div 
          className="icon-container" 
          style={{ 
            backgroundColor: `${color}26`, // approx 15% opacity
            padding: '12px',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          {Icon && <Icon size={24} style={{ color: color }} />}
        </div>
        {hasChange && (
          <div className={`change-indicator ${isPositiveChange ? 'positive' : 'negative'}`} style={{ display: 'flex', alignItems: 'center', color: isPositiveChange ? 'var(--severity-low)' : 'var(--severity-critical)' }}>
            {isPositiveChange ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span style={{ marginLeft: '4px', fontWeight: 'bold' }}>{Math.abs(Number(change))}%</span>
          </div>
        )}
      </div>
      <div className="stat-card-body" style={{ marginTop: '16px' }}>
        <h3 className="stat-value" style={{ fontSize: '2rem', margin: 0 }}>{value}</h3>
        <p className="stat-title" style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{title}</p>
        {changeLabel && <span className="stat-change-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{changeLabel}</span>}
      </div>
    </div>
  );
};

export default StatsCard;
