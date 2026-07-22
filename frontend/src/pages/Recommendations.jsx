import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
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
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-siem-cyan animate-spin" />
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
      case 'Monitor': return 'bg-siem-green/15 text-siem-green border-siem-green/30';
      case 'Investigate': return 'bg-siem-medium/15 text-siem-medium border-siem-medium/30';
      case 'Escalate': return 'bg-siem-orange/15 text-siem-orange border-siem-orange/30';
      case 'Isolate': return 'bg-siem-critical/15 text-siem-critical border-siem-critical/30 shadow-glow-critical';
      default: return 'bg-siem-hover text-siem-muted border-siem-border';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'text-siem-medium';
      case 'in_progress': return 'text-siem-cyan';
      case 'completed': return 'text-siem-green';
      case 'dismissed': return 'text-siem-muted';
      default: return 'text-siem-muted';
    }
  };

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
            Automated Incident Response & Guidance
          </motion.h1>
          <p className="text-xs font-mono text-siem-muted mt-1.5 ml-5">
            AI-driven threat mitigation Playbooks & SOC analyst escalation guidelines
          </p>
        </div>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Flagged Incidents", value: totalIncidents, icon: ShieldAlert, color: "text-siem-cyan" },
          { title: "Pending Response Actions", value: pendingCount, icon: Clock, color: "text-siem-medium" },
          { title: "Critical Isolations Required", value: criticalEscalations, icon: AlertTriangle, color: "text-siem-critical" },
          { title: "Successfully Mitigated", value: resolvedCount, icon: CheckCircle, color: "text-siem-green" }
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

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 border ${
              activeFilter === tab.id
                ? 'bg-siem-cyan/15 text-siem-cyan border-siem-cyan/40 shadow-glow-cyan font-bold'
                : 'bg-siem-bg/40 text-siem-secondaryText border-siem-border hover:bg-siem-hover hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recommendation Cards List */}
      <div className="space-y-4">
        {sortedAndFiltered.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="glass-panel glass-panel-hover p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
          >
            {/* Risk Gauge */}
            <div className="shrink-0 w-24">
              <RiskGauge score={rec.risk_score} size={85} />
            </div>

            {/* Incident Details */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-bold text-base text-white">{rec.attack_type}</h3>
                <SeverityBadge severity={rec.severity} />
              </div>
              <div className="font-mono text-xs text-siem-muted space-x-2">
                <span className="text-siem-cyan">{rec.source_ip}</span>
                <span>•</span>
                <span className="text-white">{rec.username}</span>
              </div>
              <div className="text-xs font-mono text-siem-secondaryText">
                <span className="text-siem-muted">Trigger Reason:</span> {rec.reason}
              </div>
              <div className="text-xs font-mono font-semibold text-white bg-siem-bg/50 p-2.5 rounded-xl border border-siem-border">
                <span className="text-siem-cyan uppercase tracking-wide mr-2">Recommended Action:</span>
                {rec.recommendation}
              </div>
            </div>

            {/* Status & Escalation Level */}
            <div className="shrink-0 flex flex-col items-start md:items-end gap-2.5">
              <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${getEscalationBadge(rec.escalation_level)}`}>
                {rec.escalation_level}
              </span>
              <span className={`text-xs font-mono font-bold capitalize ${getStatusColor(rec.status)}`}>
                Status: {rec.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-mono text-siem-muted">
                {new Date(rec.timestamp).toLocaleString()}
              </span>
            </div>
          </motion.div>
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
