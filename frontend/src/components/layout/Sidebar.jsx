import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  Search,
  BarChart3,
  GitBranch,
  Brain,
  ShieldAlert,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useSiemStore } from '../../store/useSiemStore';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/events', label: 'Event Explorer', icon: Search },
  { path: '/threats', label: 'Threat Analytics', icon: BarChart3 },
  { path: '/attack-chains', label: 'Attack Chains', icon: GitBranch },
  { path: '/ml', label: 'ML Performance', icon: Brain },
  { path: '/recommendations', label: 'Recommendations', icon: ShieldAlert },
  { path: '/compliance', label: 'Compliance', icon: ClipboardCheck },
];

export const Sidebar = () => {
  const { sidebarOpen, toggleSidebar } = useSiemStore();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 80 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col h-screen bg-siem-secondary/90 backdrop-blur-2xl border-r border-siem-border z-40 shrink-0 select-none"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-siem-border overflow-hidden">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-siem-cyan/20 to-siem-purple/20 border border-siem-cyan/30 text-siem-cyan shadow-glow-cyan shrink-0">
          <Shield className="w-5 h-5 animate-pulse" />
        </div>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col whitespace-nowrap"
          >
            <span className="font-display font-bold text-lg text-white tracking-wide">
              SIEM <span className="text-siem-cyan">SOC</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-siem-muted uppercase">
              Threat Intelligence
            </span>
          </motion.div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? 'text-siem-cyan bg-siem-cyan/10 border border-siem-cyan/30 shadow-glow-cyan'
                  : 'text-siem-secondaryText hover:text-white hover:bg-siem-hover'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-siem-cyan' : 'text-siem-muted group-hover:text-white'
                  }`}
                />
                {sidebarOpen && (
                  <span className="whitespace-nowrap font-medium tracking-wide">
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-siem-cyan rounded-r-full shadow-glow-cyan"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Status Footer & Collapse Toggle */}
      <div className="p-4 border-t border-siem-border space-y-3">
        {sidebarOpen && (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-siem-bg/50 border border-siem-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-siem-green animate-ping" />
              <span className="text-xs font-mono text-siem-secondaryText">Status: Optimal</span>
            </div>
            <Activity className="w-3.5 h-3.5 text-siem-green" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full py-2 rounded-xl border border-siem-border bg-siem-bg/30 text-siem-muted hover:text-white hover:bg-siem-hover transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
};
