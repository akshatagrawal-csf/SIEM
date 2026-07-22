import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Clock, AlertTriangle, CheckCircle, RefreshCw, Play, Check, X } from 'lucide-react';
import { api } from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import RiskGauge from '../components/RiskGauge';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

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

  const handleAction = (id, newStatus, actionName) => {
    setRecommendations(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
    setToastMessage(`[SUCCESS] ${actionName} executed for recommendation #${id}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  const totalIncidents = recommendations.length;
  const pendingCount = recommendations.filter(r => r.status === 'pending').length;
  const criticalEscalations = recommendations.filter(r => r.escalation_level === 'Isolate' || r.escalation_level === 'Escalate').length;
  const resolvedCount = recommendations.filter(r => r.status === 'completed').length;

  const tabs = [
    { id: 'all', label: 'All Actions' },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'dismissed', label: 'Dismissed' }
  ];

  const filtered = activeFilter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.status === activeFilter);
  
  const sortedAndFiltered = [...filtered].sort((a, b) => b.risk_score - a.risk_score);

  const getEscalationBadge = (level) => {
    switch(level) {
      case 'Monitor': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Investigate': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Escalate': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Isolate': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-siem-card text-siem-muted border-siem-border';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'text-amber-400';
      case 'in_progress': return 'text-blue-400';
      case 'completed': return 'text-emerald-400';
      case 'dismissed': return 'text-siem-muted';
      default: return 'text-siem-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Automated Incident Response & Guidance
          </h1>
          <p className="text-xs text-siem-muted mt-1">
            AI-driven threat mitigation playbooks & SOC analyst response actions
          </p>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-lg flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Total Flagged Incidents", value: totalIncidents, icon: ShieldAlert, color: "text-blue-400" },
          { title: "Pending Response Actions", value: pendingCount, icon: Clock, color: "text-amber-400" },
          { title: "Critical Isolations Required", value: criticalEscalations, icon: AlertTriangle, color: "text-red-400" },
          { title: "Successfully Mitigated", value: resolvedCount, icon: CheckCircle, color: "text-emerald-400" }
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

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors border ${
              activeFilter === tab.id
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 font-semibold'
                : 'bg-siem-card text-siem-secondaryText border-siem-border hover:bg-siem-hover hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recommendation Cards List */}
      <div className="space-y-4">
        {sortedAndFiltered.map((rec) => (
          <div
            key={rec.id}
            className="glass-panel p-5 flex flex-col md:flex-row items-start md:items-center gap-5 border border-siem-border bg-siem-card rounded-lg"
          >
            {/* Risk Gauge */}
            <div className="shrink-0 w-24">
              <RiskGauge score={rec.risk_score} size={80} />
            </div>

            {/* Incident Details */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-base text-white">{rec.attack_type}</h3>
                <SeverityBadge severity={rec.severity} />
              </div>
              <div className="font-mono text-xs text-siem-muted space-x-2">
                <span className="text-blue-400">{rec.source_ip}</span>
                <span>•</span>
                <span className="text-white">{rec.username}</span>
              </div>
              <div className="text-xs text-siem-secondaryText">
                <span className="text-siem-muted font-medium">Trigger Reason:</span> {rec.reason}
              </div>
              <div className="text-xs font-semibold text-white bg-siem-secondary p-2.5 rounded-md border border-siem-border">
                <span className="text-blue-400 uppercase tracking-wide mr-2">Recommended Action:</span>
                {rec.recommendation}
              </div>
            </div>

            {/* Status, Escalation Level & Action Buttons */}
            <div className="shrink-0 flex flex-col items-start md:items-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-siem-border">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${getEscalationBadge(rec.escalation_level)}`}>
                  {rec.escalation_level}
                </span>
                <span className={`text-xs font-semibold capitalize ${getStatusColor(rec.status)}`}>
                  {rec.status.replace('_', ' ')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {rec.status !== 'completed' && (
                  <button
                    onClick={() => handleAction(rec.id, 'completed', 'Mitigation')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Execute Mitigation</span>
                  </button>
                )}
                {rec.status !== 'dismissed' && (
                  <button
                    onClick={() => handleAction(rec.id, 'dismissed', 'Dismiss Incident')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-siem-secondary text-siem-muted border border-siem-border hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>
                )}
              </div>

              <span className="text-[10px] font-mono text-siem-muted">
                {new Date(rec.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {sortedAndFiltered.length === 0 && (
          <div className="glass-panel p-12 text-center text-xs font-mono text-siem-muted">
            No recommendations match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
