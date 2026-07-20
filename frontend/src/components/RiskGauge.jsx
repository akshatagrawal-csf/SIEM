import React, { useState, useEffect } from 'react';

const RiskGauge = ({ score, size = 140, label }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.min(Math.max(score, 0), 100);
    if (start === end) return;
    
    const duration = 1000;
    const incrementTime = (duration / end);
    
    const timer = setInterval(() => {
      start += 1;
      setAnimatedScore(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [score]);

  const getColor = (val) => {
    if (val < 30) return 'var(--severity-low)';
    if (val < 60) return 'var(--severity-medium)';
    if (val < 80) return 'var(--severity-high)';
    return 'var(--severity-critical)';
  };

  const color = getColor(animatedScore);
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--bg-tertiary)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ 
              transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease',
              filter: `drop-shadow(0 0 4px ${color})`
            }}
          />
        </svg>
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <span style={{ fontSize: size * 0.25, fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {animatedScore}
          </span>
        </div>
      </div>
      <div style={{ marginTop: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
        {label || (score < 30 ? 'Low Risk' : score < 60 ? 'Medium Risk' : score < 80 ? 'High Risk' : 'Critical Risk')}
      </div>
    </div>
  );
};

export default RiskGauge;
