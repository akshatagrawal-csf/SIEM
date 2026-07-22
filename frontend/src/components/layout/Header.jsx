import React, { useState, useEffect } from 'react';
import { Bell, Search, ShieldAlert, Cpu, Radio } from 'lucide-react';
import { useSiemStore } from '../../store/useSiemStore';

export const Header = () => {
  const { activeThreats } = useSiemStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between h-20 px-8 bg-siem-secondary/70 backdrop-blur-xl border-b border-siem-border z-30 shrink-0 select-none">
      {/* Search Input Bar */}
      <div className="relative w-72 md:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-siem-muted" />
        <input
          type="text"
          placeholder="Search IP, Hash, User, or Event..."
          className="w-full pl-10 pr-4 py-2 text-xs font-mono bg-siem-bg/50 border border-siem-border rounded-xl text-white placeholder-siem-muted focus:outline-none focus:border-siem-cyan/50 focus:ring-1 focus:ring-siem-cyan/50 transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-siem-muted border border-siem-border px-1.5 py-0.5 rounded-md">
          ⌘K
        </span>
      </div>

      {/* Action Indicators & Time */}
      <div className="flex items-center gap-5">
        {/* Live Event Stream Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-siem-cyan/10 border border-siem-cyan/20">
          <Radio className="w-3.5 h-3.5 text-siem-cyan animate-pulse" />
          <span className="text-xs font-mono font-medium text-siem-cyan">LIVE STREAM</span>
        </div>

        {/* Threat Alert Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-siem-critical/10 border border-siem-critical/30 shadow-glow-critical">
          <ShieldAlert className="w-4 h-4 text-siem-critical animate-bounce" />
          <span className="text-xs font-mono font-bold text-siem-critical">
            {activeThreats} THREATS
          </span>
        </div>

        {/* Live Clock */}
        <div className="hidden md:flex flex-col text-right font-mono text-xs text-siem-secondaryText">
          <span className="text-white font-medium">{time.toLocaleTimeString()}</span>
          <span className="text-[10px] text-siem-muted">{time.toLocaleDateString()}</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-siem-bg/50 border border-siem-border text-siem-secondaryText hover:text-white hover:border-siem-cyan/40 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-siem-cyan shadow-glow-cyan" />
        </button>
      </div>
    </header>
  );
};
