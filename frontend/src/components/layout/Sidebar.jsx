import React from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  Activity,
  Globe
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
      animate={{ width: sidebarOpen ? 250 : 75 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative flex flex-col h-screen bg-siem-card border-r border-siem-border z-40 shrink-0 select-none"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-siem-border overflow-hidden">
        <Link to="/landing" className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded bg-siem-orange font-mono font-black text-black shrink-0">
            S
          </div>
          {sidebarOpen && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-mono font-bold text-base text-white tracking-wider">
                SIEM <span className="text-siem-orange">SOC</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-siem-muted uppercase">
                Operational Authority
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded text-xs font-mono font-medium transition-colors group ${
                isActive
                  ? 'text-siem-orange bg-siem-orange/10 border border-siem-orange/30 font-bold'
                  : 'text-siem-secondaryText hover:text-white hover:bg-siem-hover'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-siem-orange' : 'text-siem-muted group-hover:text-white'
                  }`}
                />
                {sidebarOpen && (
                  <span className="whitespace-nowrap truncate">
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-siem-orange rounded-r" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Link back to Landing Page */}
        <Link
          to="/landing"
          className="relative flex items-center gap-3 px-3 py-2.5 rounded text-xs font-mono font-medium text-siem-muted hover:text-siem-orange hover:bg-siem-hover transition-colors mt-4 border-t border-siem-border/60"
        >
          <Globe className="w-4 h-4 text-siem-muted group-hover:text-siem-orange shrink-0" />
          {sidebarOpen && <span className="whitespace-nowrap">Landing Page</span>}
        </Link>
      </nav>

      {/* System Status Footer & Collapse Toggle */}
      <div className="p-3 border-t border-siem-border space-y-2">
        {sidebarOpen && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-siem-bg border border-siem-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-siem-emerald animate-ping" />
              <span className="text-[11px] font-mono text-siem-secondaryText">SOC Online</span>
            </div>
            <Activity className="w-3.5 h-3.5 text-siem-emerald" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full py-1.5 rounded border border-siem-border bg-siem-bg text-siem-muted hover:text-white hover:bg-siem-hover transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
};
