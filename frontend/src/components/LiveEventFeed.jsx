import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Shield } from 'lucide-react';

const LiveEventFeed = ({ events = [], maxItems = 20 }) => {
  const [displayEvents, setDisplayEvents] = useState([]);
  const [eventIndex, setEventIndex] = useState(0);

  useEffect(() => {
    if (!events || events.length === 0) return;

    // Initialize with first few events if available
    setDisplayEvents(events.slice(0, Math.min(5, events.length)));
    setEventIndex(Math.min(5, events.length));

    const interval = setInterval(() => {
      setDisplayEvents(prev => {
        const nextEvent = events[eventIndex % events.length];
        const newEvent = { ...nextEvent, _id: Date.now() }; // unique id for animation
        const newFeed = [newEvent, ...prev].slice(0, maxItems);
        return newFeed;
      });
      setEventIndex(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [events, eventIndex, maxItems]);

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'var(--severity-critical)';
      case 'high': return 'var(--severity-high)';
      case 'medium': return 'var(--severity-medium)';
      case 'low': return 'var(--severity-low)';
      default: return 'var(--text-muted)';
    }
  };

  const getEventIcon = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('login') || t.includes('auth')) return <Shield size={14} />;
    if (t.includes('alert') || t.includes('threat')) return <AlertTriangle size={14} />;
    return <Clock size={14} />;
  };

  return (
    <div className="live-feed glass-card" style={{ padding: '16px', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Live Event Feed</h3>
      <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayEvents.map((evt) => (
          <div 
            key={evt._id || evt.id || Math.random()} 
            className="live-feed-item"
            style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              borderLeft: `4px solid ${getSeverityColor(evt.severity)}`,
              animation: 'fadeIn 0.5s ease-out'
            }}
          >
            <div style={{ color: getSeverityColor(evt.severity), marginTop: '2px' }}>
              {getEventIcon(evt.type)}
            </div>
            <div className="feed-content" style={{ flexGrow: 1, fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="feed-type" style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{evt.type || 'Unknown Event'}</span>
                <span className="feed-time" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="feed-detail" style={{ color: 'var(--text-secondary)' }}>
                {evt.source_ip && evt.dest_ip ? (
                  <span>{evt.source_ip} &rarr; {evt.dest_ip}</span>
                ) : (
                  <span>{evt.description || 'System event recorded'}</span>
                )}
                {evt.username && <span style={{ marginLeft: '8px', color: 'var(--accent-primary)' }}>@{evt.username}</span>}
              </div>
            </div>
          </div>
        ))}
        {displayEvents.length === 0 && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Waiting for events...</div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LiveEventFeed;
