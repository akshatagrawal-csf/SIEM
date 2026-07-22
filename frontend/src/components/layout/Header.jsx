import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, ShieldAlert, Radio, X } from 'lucide-react';
import { useSiemStore } from '../../store/useSiemStore';

export const Header = () => {
  const navigate = useNavigate();
  const { activeThreats } = useSiemStore();
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  const sampleNotifications = [
    { id: 1, text: "Critical: Brute force attack from 45.33.32.156", time: "2m ago", severe: true },
    { id: 2, text: "Warning: Data exfiltration threshold exceeded on 192.168.1.50", time: "15m ago", severe: true },
    { id: 3, text: "Notice: ISO-27001 compliance audit report generated", time: "1h ago", severe: false },
  ];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setUnreadCount(0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-siem-card border-b border-siem-border z-30 shrink-0 select-none">
      {/* Search Input Bar with Working Submit Button */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center w-72 md:w-96">
        <button type="submit" title="Search logs" className="absolute left-3 top-1/2 -translate-y-1/2 text-siem-muted hover:text-siem-orange transition-colors">
          <Search className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search IP, Username, Event Type..."
          className="w-full pl-9 pr-20 py-1.5 text-xs font-mono bg-siem-bg border border-siem-border rounded text-white placeholder-siem-muted focus:outline-none focus:border-siem-orange transition-colors"
        />
        {searchQuery ? (
          <button 
            type="button" 
            onClick={() => setSearchQuery('')} 
            className="absolute right-12 top-1/2 -translate-y-1/2 text-siem-muted hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-siem-orange text-black hover:bg-orange-500 transition-colors uppercase"
        >
          Search
        </button>
      </form>

      {/* Action Indicators & Time */}
      <div className="flex items-center gap-4 relative">
        {/* Live Event Stream Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-siem-orange/10 border border-siem-orange/30">
          <Radio className="w-3.5 h-3.5 text-siem-orange animate-pulse" />
          <span className="text-[11px] font-mono font-medium text-siem-orange">REALTIME STREAM</span>
        </div>

        {/* Threat Alert Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-siem-crimson/10 border border-siem-crimson/30">
          <ShieldAlert className="w-3.5 h-3.5 text-siem-crimson" />
          <span className="text-[11px] font-mono font-bold text-siem-crimson">
            {activeThreats} THREATS
          </span>
        </div>

        {/* Live Clock */}
        <div className="hidden md:flex flex-col text-right font-mono text-xs text-siem-secondaryText">
          <span className="text-white font-medium">{time.toLocaleTimeString()}</span>
          <span className="text-[10px] text-siem-muted">{time.toLocaleDateString()}</span>
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button 
            onClick={handleNotificationClick}
            className="relative p-2 rounded bg-siem-bg border border-siem-border text-siem-secondaryText hover:text-white hover:border-siem-orange/40 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-siem-crimson" />
            )}
          </button>

          {/* Notification Popup Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-siem-card border border-siem-border rounded-lg shadow-2xl p-4 z-50">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-siem-border">
                <h4 className="text-xs font-mono font-bold text-white uppercase">System Notifications</h4>
                <button onClick={() => setShowNotifications(false)} className="text-siem-muted hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar font-mono">
                {sampleNotifications.map(n => (
                  <div key={n.id} className="p-2.5 rounded bg-siem-bgSecondary border border-siem-border text-xs space-y-1">
                    <div className="flex justify-between items-start">
                      <span className={`font-medium text-[11px] ${n.severe ? 'text-siem-crimson' : 'text-siem-emerald'}`}>
                        {n.text}
                      </span>
                    </div>
                    <div className="text-[10px] text-siem-muted">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
