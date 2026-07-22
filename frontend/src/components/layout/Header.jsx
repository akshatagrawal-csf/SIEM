import React, { useState, useEffect } from 'react';
import { Bell, Search, ShieldAlert, Radio, X, CheckCircle2 } from 'lucide-react';
import { useSiemStore } from '../../store/useSiemStore';

export const Header = () => {
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

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-siem-secondary border-b border-siem-border z-30 shrink-0 select-none">
      {/* Search Input Bar */}
      <div className="relative w-72 md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-siem-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search IP, Hash, User, or Event..."
          className="w-full pl-9 pr-8 py-1.5 text-xs font-mono bg-siem-bg border border-siem-border rounded-md text-white placeholder-siem-muted focus:outline-none focus:border-blue-500 transition-colors"
        />
        {searchQuery ? (
          <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-siem-muted hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-siem-muted border border-siem-border px-1 rounded">
            ⌘K
          </span>
        )}
      </div>

      {/* Action Indicators & Time */}
      <div className="flex items-center gap-4 relative">
        {/* Live Event Stream Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20">
          <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span className="text-[11px] font-mono font-medium text-blue-400">REALTIME STREAM</span>
        </div>

        {/* Threat Alert Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[11px] font-mono font-bold text-red-400">
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
            className="relative p-2 rounded-md bg-siem-bg border border-siem-border text-siem-secondaryText hover:text-white hover:border-siem-muted/40 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* Notification Popup Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-siem-card border border-siem-border rounded-lg shadow-xl p-4 z-50">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-siem-border">
                <h4 className="text-xs font-semibold text-white">System Notifications</h4>
                <button onClick={() => setShowNotifications(false)} className="text-siem-muted hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar">
                {sampleNotifications.map(n => (
                  <div key={n.id} className="p-2.5 rounded bg-siem-secondary border border-siem-border text-xs space-y-1">
                    <div className="flex justify-between items-start">
                      <span className={`font-medium text-[11px] ${n.severe ? 'text-red-400' : 'text-emerald-400'}`}>
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
