import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

const Header = ({ title, subtitle }) => {
  const [notifications] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="page-header">
      <div className="header-titles">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="header-actions">
        <div className="datetime-display">
          {currentTime.toLocaleString()}
        </div>
        <div className="notification-container" style={{ position: 'relative' }}>
          <Bell size={24} style={{ color: 'var(--text-secondary)' }} />
          {notifications > 0 && (
            <span 
              className="notification-badge" 
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: 'var(--severity-critical)',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold'
              }}
            >
              {notifications}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
