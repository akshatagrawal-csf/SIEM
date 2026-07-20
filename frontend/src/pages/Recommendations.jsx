import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import SeverityBadge from '../components/SeverityBadge';
import RiskGauge from '../components/RiskGauge';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getRecommendations();
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-primary)', padding: '24px' }}>Loading...</div>;
  }

  const totalIncidents = recommendations.length;
  const pendingCount = recommendations.filter(r => r.status === 'pending').length;
  const criticalEscalations = recommendations.filter(r => r.escalation_level === 'Isolate' || r.escalation_level === 'Escalate').length;
  const resolvedCount = recommendations.filter(r => r.status === 'completed').length;

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'dismissed', label: 'Dismissed' }
  ];

  const filtered = activeFilter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.status === activeFilter);
  
  const sortedAndFiltered = [...filtered].sort((a, b) => b.risk_score - a.risk_score);

  const getEscalationStyle = (level) => {
    switch(level) {
      case 'Monitor': return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'Investigate': return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
      case 'Escalate': return { backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.2)' };
      case 'Isolate': return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
      default: return { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' };
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#06b6d4';
      case 'completed': return '#10b981';
      case 'dismissed': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', color: 'var(--text-primary)' }}>
      <Header title="Incident Recommendations" subtitle="AI-powered incident response and escalation guidance" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard title="Total Incidents" value={totalIncidents} icon={ShieldAlert} color="#06b6d4" />
        <StatsCard title="Pending" value={pendingCount} icon={Clock} color="#f59e0b" />
        <StatsCard title="Critical Escalations" value={criticalEscalations} icon={AlertTriangle} color="#ef4444" />
        <StatsCard title="Resolved" value={resolvedCount} icon={CheckCircle} color="#10b981" />
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md, 8px)',
              border: activeFilter === tab.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              backgroundColor: activeFilter === tab.id ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              color: activeFilter === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeFilter === tab.id ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sortedAndFiltered.map(rec => (
          <div key={rec.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            backgroundColor: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '24px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flexShrink: 0, width: '90px' }}>
              <RiskGauge score={rec.risk_score} size={90} />
            </div>

            <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{rec.attack_type}</span>
                <SeverityBadge severity={rec.severity} />
              </div>
              <div style={{ fontSize: '13px' }}>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{rec.source_ip}</span>
                <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>•</span>
                <span style={{ color: 'var(--text-secondary)' }}>{rec.username}</span>
              </div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Reason:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{rec.reason}</span>
              </div>
              <div style={{ fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Action:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.recommendation}</span>
              </div>
            </div>

            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                ...getEscalationStyle(rec.escalation_level)
              }}>
                {rec.escalation_level}
              </span>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: getStatusColor(rec.status),
                textTransform: 'capitalize'
              }}>
                {rec.status.replace('_', ' ')}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {new Date(rec.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
        {sortedAndFiltered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-glass)', borderRadius: 'var(--radius-lg, 16px)' }}>
            No recommendations found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
