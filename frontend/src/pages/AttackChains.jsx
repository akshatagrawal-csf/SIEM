import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, ShieldAlert, Activity, GitBranch, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import AttackChainGraph from '../components/AttackChainGraph';

export default function AttackChains() {
  const [chains, setChains] = useState([]);
  const [selectedChain, setSelectedChain] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-siem-cyan animate-spin" />
      </div>
    );
  }

  const totalChains = chains.length;
  const criticalChains = chains.filter(c => c.severity?.toLowerCase() === 'critical').length;
  const avgRisk = chains.length > 0 ? Math.round(chains.reduce((acc, c) => acc + c.risk_score, 0) / chains.length) : 0;
  const totalStages = chains.reduce((acc, c) => acc + (c.stages ? c.stages.length : 0), 0);

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
            Attack-Chain Correlation Visualizer
          </motion.h1>
          <p className="text-xs font-mono text-siem-muted mt-1.5 ml-5">
            Multi-stage APT threat reconstruction & progression timeline
          </p>
        </div>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Correlated Attack Chains", value: totalChains, icon: Network, color: "text-siem-cyan" },
          { title: "Critical Escalations", value: criticalChains, icon: ShieldAlert, color: "text-siem-critical" },
          { title: "Average Risk Rating", value: `${avgRisk}/100`, icon: Activity, color: "text-siem-medium" },
          { title: "Total Attack Stages", value: totalStages, icon: GitBranch, color: "text-siem-purple" }
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

      {/* Main Graph & Selection Column */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[550px]">
        {/* Left Column: Chain Selection List */}
        <div className="w-full lg:w-80 flex flex-col gap-3 shrink-0">
          <h3 className="text-xs font-mono text-siem-muted uppercase tracking-wider px-1">Detected Incidents</h3>
          <div className="space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar pr-1">
            {chains.map(chain => {
              const isSelected = selectedChain && selectedChain.id === chain.id;
              return (
                <div
                  key={chain.id}
                  onClick={() => setSelectedChain(chain)}
                  className={`glass-panel p-4 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-siem-cyan bg-siem-cyan/10 shadow-glow-cyan' 
                      : 'hover:border-siem-border/80 hover:bg-siem-hover'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-display font-semibold text-sm text-white line-clamp-1">{chain.name}</span>
                    <SeverityBadge severity={chain.severity} />
                  </div>
                  <div className="font-mono text-xs text-siem-cyan mb-2">
                    {chain.source_ip} &rarr; {chain.target_system}
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono text-siem-muted">
                    <span>Risk: <strong className="text-siem-cyan">{chain.risk_score}</strong></span>
                    <span className="px-2 py-0.5 rounded-full bg-siem-bg/60 border border-siem-border text-siem-secondaryText">
                      {chain.stages?.length || 0} stages
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: React Flow Graph Canvas */}
        <div className="flex-1 glass-panel p-4 min-h-[450px]">
          {selectedChain ? (
            <AttackChainGraph chain={selectedChain} />
          ) : (
            <div className="flex items-center justify-center h-full font-mono text-xs text-siem-muted">
              Select an attack chain from the left panel to inspect graph
            </div>
          )}
        </div>
      </div>

      {/* Stage Progression Timeline */}
      {selectedChain && selectedChain.stages && selectedChain.stages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-6">Stage Progression Timeline</h3>
          <div className="relative border-l-2 border-siem-border ml-4 space-y-6 pb-2">
            {selectedChain.stages.map((stage, idx) => {
              const sev = stage.severity?.toLowerCase();
              let dotBg = 'bg-siem-green';
              if (sev === 'critical') dotBg = 'bg-siem-critical shadow-glow-critical';
              else if (sev === 'high') dotBg = 'bg-siem-high';
              else if (sev === 'medium') dotBg = 'bg-siem-medium';

              return (
                <div key={idx} className="relative pl-8 group">
                  <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-siem-bg ${dotBg}`} />
                  <div className="glass-panel p-4 border border-siem-border group-hover:border-siem-cyan/30 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-display font-bold text-sm text-white">{stage.type}</span>
                      <SeverityBadge severity={stage.severity} />
                    </div>
                    <p className="font-mono text-xs text-siem-muted mb-2">{new Date(stage.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-siem-secondaryText font-mono">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
