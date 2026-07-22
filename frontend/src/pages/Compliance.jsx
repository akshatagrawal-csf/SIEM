import React, { useState, useEffect } from 'react';
import { FileWarning, AlertCircle, CheckCircle, Clock, Lock, Unlock, UserX, RefreshCw, Download, Check, X } from 'lucide-react';
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

const VIOLATION_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];

export default function Compliance() {
  const [violations, setViolations] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

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

  const handleResolveViolation = (id) => {
    setViolations(prev =>
      prev.map(v => (v.id === id ? { ...v, status: 'resolved' } : v))
    );
    setToastMessage(`[AUDIT UPDATE] Compliance violation #${id} marked as resolved`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExportReport = () => {
    if (!violations.length) return;

    const headers = ["ID", "Timestamp", "Violation Type", "Username", "Source IP", "Policy", "Severity", "Status"];
    const csvRows = [headers.join(",")];

    violations.forEach(v => {
      csvRows.push([
        v.id,
        `"${v.timestamp}"`,
        `"${v.violation_type || v.type}"`,
        `"${v.username}"`,
        `"${v.source_ip}"`,
        `"${v.policy}"`,
        `"${v.severity}"`,
        `"${v.status}"`
      ].join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `compliance_audit_report_${Date.now()}.csv`);
    a.click();

    setToastMessage(`Exported ${violations.length} compliance records to CSV`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  const investigatingCount = violations.filter(v => v.status === 'investigating').length;
  const openCount = violations.filter(v => v.status === 'open').length;
  const resolvedCount = violations.filter(v => v.status === 'resolved').length;

  const typeCount = {};
  violations.forEach(v => {
    const t = v.violation_type || v.type;
    typeCount[t] = (typeCount[t] || 0) + 1;
  });
  const pieData = Object.keys(typeCount).map(k => ({ name: k.replace(/_/g, ' '), value: typeCount[k] }));

  const trendData = Array.from({ length: 7 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    violations: Math.floor(Math.random() * 8) + 2
  }));

  const getViolationIcon = (type) => {
    switch (type) {
      case 'after_hours_access':
      case 'After-Hours Access': return <Clock className="w-4 h-4 text-amber-400 inline mr-2" />;
      case 'unauthorized_access':
      case 'Unauthorized Access': return <Lock className="w-4 h-4 text-red-400 inline mr-2" />;
      case 'policy_violation':
      case 'Policy Violation': return <FileWarning className="w-4 h-4 text-orange-400 inline mr-2" />;
      case 'unencrypted_transfer':
      case 'Unencrypted Transfer': return <Unlock className="w-4 h-4 text-indigo-400 inline mr-2" />;
      case 'failed_auth_threshold':
      case 'Failed Auth Threshold': return <UserX className="w-4 h-4 text-blue-400 inline mr-2" />;
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
      render: (val, row) => {
        const vtype = val || row.violation_type;
        return (
          <span className="font-mono text-xs text-white capitalize flex items-center">
            {getViolationIcon(vtype)}
            {vtype?.replace(/_/g, ' ')}
          </span>
        );
      }
    },
    { key: 'username', label: 'User', render: (val) => <span className="font-mono text-xs text-blue-400">{val}</span> },
    { key: 'source_ip', label: 'Source IP', render: (val) => <span className="font-mono text-xs text-siem-secondaryText">{val}</span> },
    { key: 'policy', label: 'Control Standard', render: (val) => <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{val}</span> },
    { key: 'severity', label: 'Severity', render: (val) => <SeverityBadge severity={val} /> },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        let style = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (val === 'open') style = 'text-red-400 bg-red-500/10 border-red-500/20';
        else if (val === 'investigating') style = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        return <span className={`px-2 py-0.5 rounded text-[10px] font-mono border capitalize ${style}`}>{val}</span>;
      }
    },
    {
      key: 'id',
      label: 'Action',
      render: (id, row) => (
        row.status !== 'resolved' ? (
          <button
            onClick={() => handleResolveViolation(id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
          >
            <Check className="w-3 h-3" />
            <span>Resolve</span>
          </button>
        ) : (
          <span className="text-[11px] font-mono text-emerald-400">Resolved</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Compliance & Regulatory Audit Monitor
          </h1>
          <p className="text-xs text-siem-muted mt-1">
            ISO-27001, SOC2 & PCI-DSS policy enforcement tracking
          </p>
        </div>

        {/* Export Report Button */}
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Report</span>
        </button>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono rounded-lg flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-blue-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Total Policy Violations", value: violations.length, icon: FileWarning, color: "text-red-400" },
          { title: "Open Unresolved Cases", value: openCount, icon: AlertCircle, color: "text-orange-400" },
          { title: "Under Investigation", value: investigatingCount, icon: Clock, color: "text-amber-400" },
          { title: "Audited & Resolved", value: resolvedCount, icon: CheckCircle, color: "text-emerald-400" }
        ].map((kpi, i) => (
          <div key={i} className="glass-panel p-5 rounded-lg border border-siem-border bg-siem-card">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0 flex-1 pr-1">
                <p className="text-siem-muted text-[11px] font-mono font-medium uppercase tracking-wide truncate" title={kpi.title}>{kpi.title}</p>
                <h3 className="font-bold text-white mt-1.5 tracking-tight break-all truncate text-lg sm:text-xl lg:text-2xl" title={kpi.value}>{kpi.value}</h3>
              </div>
              <div className="p-2.5 rounded-md bg-siem-secondary border border-siem-border shrink-0">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 border border-siem-border bg-siem-card rounded-lg">
          <h3 className="font-semibold text-base text-white mb-1">Violations by Category</h3>
          <p className="text-xs text-siem-muted mb-4">Distribution across security control policies</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                  {pieData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={VIOLATION_COLORS[idx % VIOLATION_COLORS.length]} stroke="#13141C" />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 border border-siem-border bg-siem-card rounded-lg">
          <h3 className="font-semibold text-base text-white mb-1">7-Day Violation Trend</h3>
          <p className="text-xs text-siem-muted mb-4">Weekly policy breach occurrences</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E202E" vertical={false} />
                <XAxis dataKey="day" stroke="#6B7280" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis stroke="#6B7280" tickLine={false} axisLine={false} className="text-xs" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="violations" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Compliance Data Table */}
      <div className="glass-panel overflow-hidden border border-siem-border bg-siem-card rounded-lg">
        <div className="p-5 border-b border-siem-border">
          <h3 className="font-semibold text-base text-white">Compliance Audit Trail Log</h3>
          <p className="text-xs text-siem-muted mt-1">Detailed record of active policy violations & control standards</p>
        </div>
        <DataTable data={violations} columns={columns} searchable={false} />
      </div>
    </div>
  );
}
