import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Search, BarChart3, GitBranch, Brain, ShieldAlert, ClipboardCheck, Activity } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/events', label: 'Event Explorer', icon: Search },
  { path: '/threats', label: 'Threat Analytics', icon: BarChart3 },
  { path: '/attack-chains', label: 'Attack Chains', icon: GitBranch },
  { path: '/ml', label: 'ML Performance', icon: Brain },
  { path: '/recommendations', label: 'Recommendations', icon: ShieldAlert },
  { path: '/compliance', label: 'Compliance', icon: ClipboardCheck },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Shield size={28} />
        <div>
          <h2>SIEM Analytics</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SOC Dashboard</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="status-dot active" style={{ animation: 'pulse 2s infinite' }}></span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>System Online</span>
      </div>
    </aside>
  );
}
