import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileWarning, AlertCircle, CheckCircle, Clock, Lock, Unlock, UserX, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import SeverityBadge from '../components/SeverityBadge';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-siem-border text-xs font-mono">
        <p className="text-siem-muted mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2" style={{ color: entry.color || entry.fill || '#fff' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill || '#fff' }} />
            <span>{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const VIOLATION_COLORS = ['#00F5FF', '#8B5CF6', '#FACC15', '#EF4444', '#10B981'];

export default function Compliance() {
  const [violations, setViolations] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getComplianceViolations();
        setViolations(data.violations || []);
        setSummary(data.summary || {});
      } catch (error) {
        console.error("Error fetching compliance data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-siem-cyan animate-spin" />
      </div>
    );
  }

  const investigatingCount = violations.filter(v => v.status === 'investigating').length;

  const typeCount = {};
  violations.forEach(v => {
    typeCount[v.type] = (typeCount[v.type] || 0) + 1;
  });
  const pieData = Object.keys(typeCount).map(k => ({ name: k.replace(/_/g, ' '), value: typeCount[k] }));

  const trendData = Array.from({ length: 7 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    violations: Math.floor(Math.random() * 8) + 2
  }));

  const getViolationIcon = (type) => {
    switch (type) {
      case 'after_hours_access': return <Clock className="w-4 h-4 text-siem-medium inline mr-2" />;
      case 'unauthorized_access': return <Lock className="w-4 h-4 text-siem-critical inline mr-2" />;
      case 'policy_violation': return <FileWarning className="w-4 h-4 text-siem-orange inline mr-2" />;
      case 'unencrypted_transfer': return <Unlock className="w-4 h-4 text-siem-purple inline mr-2" />;
      case 'failed_auth_threshold': return <UserX className="w-4 h-4 text-siem-cyan inline mr-2" />;
      default: return <AlertCircle className="w-4 h-4 text-siem-muted inline mr-2" />;
    }
  };

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (val) => (
        <span className="font-mono text-xs text-siem-secondaryText">
          {new Date(val).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Violation Type',
      render: (val) => (
        <span className="font-mono text-xs text-white capitalize flex items-center">
          {getViolationIcon(val)}
          {val.replace(/_/g, ' ')}
        </span>
      )
    },
    { key: 'username', label: 'User', render: (val) => <span className="font-mono text-xs text-siem-cyan">{val}</span> },
    { key: 'source_ip', label: 'Source IP', render: (val) => <span className="font-mono text-xs text-siem-secondaryText">{val}</span> },
    { key: 'policy', label: 'Control Standard', render: (val) => <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-siem-purple/15 text-siem-purple border border-siem-purple/30">{val}</span> },
    { key: 'severity', label: 'Severity', render: (val) => <SeverityBadge severity={val} /> },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        let style = 'text-siem-green bg-siem-green/10 border-siem-green/30';
        if (val === 'open') style = 'text-siem-critical bg-siem-critical/10 border-siem-critical/30';
        else if (val === 'investigating') style = 'text-siem-medium bg-siem-medium/10 border-siem-medium/30';
        return <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border capitalize ${style}`}>{val}</span>;
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-display font-semibold text-white flex items-center gap-3"
          >
            <span className="w-2.5 h-8 bg-siem-cyan rounded-full animate-pulse shadow-glow-cyan" />
            Compliance & Regulatory Audit Monitor
          </motion.h1>
          <p className="text-xs font-mono text-siem-muted mt-1.5 ml-5">
            ISO-27001, SOC2 & NIST policy enforcement tracking
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Policy Violations", value: summary.total || violations.length, icon: FileWarning, color: "text-siem-critical" },
          { title: "Open Unresolved Cases", value: summary.open || 0, icon: AlertCircle, color: "text-siem-orange" },
          { title: "Under Investigation", value: investigatingCount, icon: Clock, color: "text-siem-medium" },
          { title: "Audited & Resolved", value: summary.resolved || 0, icon: CheckCircle, color: "text-siem-green" }
        ].map((kpi, i) => (
          <motion.div key={i} whileHover={{ y: -4, scale: 1.01 }} className="glass-panel p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-siem-muted text-xs font-mono uppercase tracking-wider">{kpi.title}</p>
                <h3 className="text-2xl font-display font-bold text-white mt-2">{kpi.value}</h3>
              </div>
              <div className="p-3 rounded-xl bg-siem-bg/50 border border-siem-border">
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-1">Violations by Category</h3>
          <p className="text-xs font-mono text-siem-muted mb-6">Distribution across security control policies</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={VIOLATION_COLORS[idx % VIOLATION_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-1">7-Day Violation Trend</h3>
          <p className="text-xs font-mono text-siem-muted mb-6">Weekly policy breach occurrences</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" tickLine={false} axisLine={false} className="font-mono text-xs" />
                <YAxis stroke="#64748B" tickLine={false} axisLine={false} className="font-mono text-xs" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="violations" stroke="#00F5FF" strokeWidth={2} dot={{ fill: '#00F5FF', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Compliance Data Table */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-siem-border">
          <h3 className="font-display font-semibold text-lg text-white">Compliance Audit Trail Log</h3>
          <p className="text-xs font-mono text-siem-muted mt-1">Detailed record of active policy violations & control standards</p>
        </div>
        <DataTable data={violations} columns={columns} searchable={false} />
      </motion.div>
    </div>
  );
}
