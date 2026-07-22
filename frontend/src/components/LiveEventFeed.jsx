import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Shield } from 'lucide-react';

const LiveEventFeed = ({ events = [], maxItems = 15 }) => {
  const [displayEvents, setDisplayEvents] = useState([]);
  const [eventIndex, setEventIndex] = useState(0);

  useEffect(() => {
    if (!events || events.length === 0) return;

    setDisplayEvents(events.slice(0, Math.min(5, events.length)));
    setEventIndex(Math.min(5, events.length));

    const interval = setInterval(() => {
      setDisplayEvents(prev => {
        const nextEvent = events[eventIndex % events.length];
        const newEvent = { ...nextEvent, _id: Date.now() };
        const newFeed = [newEvent, ...prev].slice(0, maxItems);
        return newFeed;
      });
      setEventIndex(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [events, eventIndex, maxItems]);

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return '#FF2255';
      case 'high': return '#FF7700';
      case 'medium': return '#FFB800';
      case 'low': return '#00FF9D';
      default: return '#71717A';
    }
  };

  const getEventIcon = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('login') || t.includes('auth')) return <Shield size={14} />;
    if (t.includes('alert') || t.includes('threat')) return <AlertTriangle size={14} />;
    return <Clock size={14} />;
  };

  return (
    <div className="flex flex-col gap-2.5 font-mono text-xs">
      {displayEvents.map((evt) => (
        <div 
          key={evt._id || evt.id || Math.random()} 
          className="flex items-center gap-3 p-3 rounded-xl bg-siem-bg/70 border border-siem-border hover:border-siem-cyan/30 transition-all"
          style={{ borderLeft: `3px solid ${getSeverityColor(evt.severity)}` }}
        >
          <div style={{ color: getSeverityColor(evt.severity) }} className="shrink-0">
            {getEventIcon(evt.event_type || evt.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <span className="font-bold text-white tracking-wide truncate">{evt.event_type || evt.type || 'Unknown Event'}</span>
              <span className="text-[10px] text-siem-muted shrink-0 ml-2">
                {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="text-[11px] text-siem-secondaryText truncate">
              {evt.source_ip && (evt.destination_ip || evt.dest_ip) ? (
                <span><strong className="text-siem-cyan">{evt.source_ip}</strong> &rarr; {evt.destination_ip || evt.dest_ip}</span>
              ) : (
                <span>{evt.description || 'Telemetry anomaly logged'}</span>
              )}
              {evt.username && <span className="ml-2 text-siem-cyan font-semibold">@{evt.username}</span>}
            </div>
          </div>
        </div>
      ))}
      {displayEvents.length === 0 && (
        <div className="text-siem-muted text-center p-8">Listening for security telemetry events...</div>
      )}
    </div>
  );
};

export default LiveEventFeed;
