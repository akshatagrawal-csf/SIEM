import React, { useState, useEffect } from 'react';
import { FileWarning, AlertCircle, Search, CheckCircle, Clock, Lock, Unlock, UserX } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import SeverityBadge from '../components/SeverityBadge';

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
    return <div style={{ color: 'var(--text-primary)', padding: '24px' }}>Loading...</div>;
  }

  const investigatingCount = violations.filter(v => v.status === 'investigating').length;

  // Process data for Pie Chart
  const typeCount = {};
  violations.forEach(v => {
    typeCount[v.type] = (typeCount[v.type] || 0) + 1;
  });
  const pieData = Object.keys(typeCount).map(key => ({ name: key.replace(/_/g, ' '), value: typeCount[key] }));
  const PIE_COLORS = ['#06b6d4','#8b5cf6','#f59e0b','#ef4444','#10b981'];

  // Process data for Line Chart
  const dateCount = {};
  violations.forEach(v => {
    const d = new Date(v.timestamp).toLocaleDateString();
    dateCount[d] = (dateCount[d] || 0) + 1;
  });
  const lineData = Object.keys(dateCount).sort((a, b) => new Date(a) - new Date(b)).map(date => ({
    date,
    count: dateCount[date]
  }));

  const tooltipStyle = {
    backgroundColor: '#111827',
    border: '1px solid rgba(148,163,184,0.1)',
    borderRadius: '8px',
    color: '#f1f5f9'
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'after_hours_access': return <Clock size={16} color="var(--text-secondary)" />;
      case 'unauthorized_access': return <Lock size={16} color="var(--severity-high)" />;
      case 'policy_violation': return <FileWarning size={16} color="var(--severity-medium)" />;
      case 'unencrypted_transfer': return <Unlock size={16} color="var(--severity-critical)" />;
      case 'failed_auth_threshold': return <UserX size={16} color="var(--accent-primary)" />;
      default: return <AlertCircle size={16} color="var(--text-secondary)" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'var(--severity-critical)';
      case 'investigating': return 'var(--severity-medium)';
      case 'resolved': return 'var(--severity-low)';
      default: return 'var(--text-secondary)';
    }
  };

  const columns = [
    { 
      key: 'timestamp', 
      label: 'Timestamp', 
      render: (v) => new Date(v.timestamp).toLocaleString() 
    },
    {
      key: 'type',
      label: 'Type',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'capitalize' }}>
          {getIconForType(v.type)}
          <span>{v.type.replace(/_/g, ' ')}</span>
        </div>
      )
    },
    { key: 'username', label: 'Username' },
    { 
      key: 'source_ip', 
      label: 'Source IP', 
      render: (v) => <span style={{ fontFamily: 'monospace' }}>{v.source_ip}</span> 
    },
    {
      key: 'policy',
      label: 'Policy',
      render: (v) => (
        <span style={{ padding: '2px 8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', fontSize: '12px', border: '1px solid var(--border-color)' }}>
          {v.policy}
        </span>
      )
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (v) => <SeverityBadge severity={v.severity} />
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span style={{ color: getStatusColor(v.status), fontWeight: 600, textTransform: 'capitalize' }}>
          {v.status}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', color: 'var(--text-primary)' }}>
      <Header title="Compliance Monitoring" subtitle="Policy violations and regulatory compliance tracking" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard title="Total Violations" value={summary.total || 0} icon={FileWarning} color="#ef4444" />
        <StatsCard title="Open Cases" value={summary.open || 0} icon={AlertCircle} color="#f97316" />
        <StatsCard title="Under Investigation" value={investigatingCount} icon={Search} color="#f59e0b" />
        <StatsCard title="Resolved" value={summary.resolved || 0} icon={CheckCircle} color="#10b981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <ChartCard title="Violations by Type">
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Violation Trend">
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(val) => val.split('/')[0] + '/' + val.split('/')[1]} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div style={{ backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl, 20px)', padding: '24px', overflow: 'hidden' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>Recent Violations</h3>
        <DataTable columns={columns} data={violations} pageSize={10} searchable={true} searchPlaceholder="Search violations..." />
      </div>
    </div>
  );
}
