import React, { useState, useEffect } from 'react';
import { Network, ShieldAlert, Activity, GitBranch, RefreshCw, Lock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { api } from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import AttackChainGraph from '../components/AttackChainGraph';

export default function AttackChains() {
  const [chains, setChains] = useState([]);
  const [selectedChain, setSelectedChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getAttackChains();
        setChains(data.chains || []);
        if (data.chains && data.chains.length > 0) {
          setSelectedChain(data.chains[0]);
        }
      } catch (error) {
        console.error("Error fetching attack chains:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = (chainId, newStatus, actionName) => {
    setChains(prev =>
      prev.map(c => (c.id === chainId ? { ...c, status: newStatus } : c))
    );
    if (selectedChain && selectedChain.id === chainId) {
      setSelectedChain(prev => ({ ...prev, status: newStatus }));
    }
    setToastMessage(`[ACTION EXECUTION] ${actionName} initiated for chain #${chainId}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  const totalChains = chains.length;
  const criticalChains = chains.filter(c => c.severity?.toLowerCase() === 'critical').length;
  const avgRisk = chains.length > 0 ? Math.round(chains.reduce((acc, c) => acc + c.risk_score, 0) / chains.length) : 0;
  const totalStages = chains.reduce((acc, c) => acc + (c.stages ? c.stages.length : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Attack-Chain Correlation Visualizer
          </h1>
          <p className="text-xs text-siem-muted mt-1">
            Multi-stage APT threat reconstruction & progression timeline
          </p>
        </div>
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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Correlated Attack Chains", value: totalChains, icon: Network, color: "text-blue-400" },
          { title: "Critical Escalations", value: criticalChains, icon: ShieldAlert, color: "text-red-400" },
          { title: "Average Risk Rating", value: `${avgRisk}/100`, icon: Activity, color: "text-amber-400" },
          { title: "Total Attack Stages", value: totalStages, icon: GitBranch, color: "text-indigo-400" }
        ].map((kpi, i) => (
          <div key={i} className="glass-panel p-5 rounded-lg border border-siem-border bg-siem-card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-siem-muted text-xs font-medium uppercase tracking-wide">{kpi.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1.5">{kpi.value}</h3>
              </div>
              <div className="p-2.5 rounded-md bg-siem-secondary border border-siem-border">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Graph & Selection Column */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[520px]">
        {/* Left Column: Chain Selection List */}
        <div className="w-full lg:w-80 flex flex-col gap-3 shrink-0">
          <h3 className="text-xs font-semibold text-siem-muted uppercase tracking-wider px-1">Detected Incidents</h3>
          <div className="space-y-3 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
            {chains.map(chain => {
              const isSelected = selectedChain && selectedChain.id === chain.id;
              return (
                <div
                  key={chain.id}
                  onClick={() => setSelectedChain(chain)}
                  className={`glass-panel p-4 cursor-pointer transition-colors border rounded-lg ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-siem-border bg-siem-card hover:bg-siem-hover'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm text-white line-clamp-1">{chain.name}</span>
                    <SeverityBadge severity={chain.severity} />
                  </div>
                  <div className="font-mono text-xs text-blue-400 mb-2">
                    {chain.source_ip} &rarr; {chain.target_system}
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono text-siem-muted">
                    <span>Risk: <strong className="text-blue-400">{chain.risk_score}</strong></span>
                    <span className="px-2 py-0.5 rounded bg-siem-secondary border border-siem-border text-siem-secondaryText capitalize">
                      {chain.status || 'active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: React Flow Graph Canvas & Action Bar */}
        <div className="flex-1 glass-panel p-4 min-h-[450px] flex flex-col border border-siem-border bg-siem-card rounded-lg">
          {selectedChain ? (
            <>
              <div className="flex flex-wrap justify-between items-center pb-3 border-b border-siem-border mb-3 gap-3">
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedChain.name}</h3>
                  <p className="text-xs font-mono text-siem-muted">Target System: {selectedChain.target_system}</p>
                </div>

                {/* Chain Interactive Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(selectedChain.id, 'contained', 'Containment')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Contain Threat</span>
                  </button>
                  <button
                    onClick={() => handleAction(selectedChain.id, 'resolved', 'Resolution')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <AttackChainGraph chain={selectedChain} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full font-mono text-xs text-siem-muted">
              Select an attack chain from the left panel to inspect graph
            </div>
          )}
        </div>
      </div>

      {/* Stage Progression Timeline */}
      {selectedChain && selectedChain.stages && selectedChain.stages.length > 0 && (
        <div className="glass-panel p-6 border border-siem-border bg-siem-card rounded-lg">
          <h3 className="font-semibold text-base text-white mb-6">Stage Progression Timeline</h3>
          <div className="relative border-l-2 border-siem-border ml-4 space-y-5 pb-2">
            {selectedChain.stages.map((stage, idx) => {
              const sev = stage.severity?.toLowerCase();
              let dotBg = 'bg-emerald-500';
              if (sev === 'critical') dotBg = 'bg-red-500';
              else if (sev === 'high') dotBg = 'bg-orange-500';
              else if (sev === 'medium') dotBg = 'bg-amber-500';

              return (
                <div key={idx} className="relative pl-7 group">
                  <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-siem-bg ${dotBg}`} />
                  <div className="glass-panel p-4 border border-siem-border rounded-lg bg-siem-secondary">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-white">{stage.type}</span>
                      <SeverityBadge severity={stage.severity} />
                    </div>
                    <p className="font-mono text-xs text-siem-muted mb-2">{new Date(stage.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-siem-secondaryText">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
