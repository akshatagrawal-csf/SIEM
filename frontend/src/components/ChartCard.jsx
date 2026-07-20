import React from 'react';

const ChartCard = ({ title, subtitle, children, action }) => {
  return (
    <div className="chart-card glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div className="chart-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{title}</h3>
          {subtitle && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{subtitle}</span>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="chart-card-content" style={{ flexGrow: 1, minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
