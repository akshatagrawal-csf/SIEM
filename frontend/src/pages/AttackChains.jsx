import React, { useState, useEffect } from 'react';
import { Network, ShieldAlert, Activity, GitBranch } from 'lucide-react';
import { api } from '../services/api';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
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
    return <div style={{ color: 'var(--text-primary)', padding: '24px' }}>Loading...</div>;
  }

  const totalChains = chains.length;
  const criticalChains = chains.filter(c => c.severity === 'critical').length;
  const avgRisk = chains.length > 0 ? Math.round(chains.reduce((acc, c) => acc + c.risk_score, 0) / chains.length) : 0;
  const totalStages = chains.reduce((acc, c) => acc + (c.stages ? c.stages.length : 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', color: 'var(--text-primary)' }}>
      <Header title="Attack Chain Analysis" subtitle="Multi-stage attack detection and correlation" />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard title="Total Chains" value={totalChains} icon={Network} color="#06b6d4" />
        <StatsCard title="Critical Chains" value={criticalChains} icon={ShieldAlert} color="#ef4444" />
        <StatsCard title="Avg Risk Score" value={avgRisk} icon={Activity} color="#f59e0b" />
        <StatsCard title="Total Stages" value={totalStages} icon={GitBranch} color="#8b5cf6" />
      </div>

      <div style={{ display: 'flex', gap: '24px', minHeight: '500px' }}>
        <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '8px' }}>
          {chains.map(chain => {
            const isSelected = selectedChain && selectedChain.id === chain.id;
            return (
              <div 
                key={chain.id}
                onClick={() => setSelectedChain(chain)}
                style={{
                  backgroundColor: 'var(--bg-glass)',
                  padding: '16px',
                  borderRadius: 'var(--radius-lg, 16px)',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{chain.name}</span>
                  <SeverityBadge severity={chain.severity} />
                </div>
                <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {chain.source_ip} &rarr; {chain.target_system}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span>Risk Score: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{chain.risk_score}</span></span>
                  <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                    {chain.stages ? chain.stages.length : 0} stages
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, backgroundColor: 'var(--bg-glass)', borderRadius: 'var(--radius-xl, 20px)', border: '1px solid var(--border-color)', padding: '24px', minHeight: '400px' }}>
          {selectedChain ? (
            <AttackChainGraph chain={selectedChain} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select an attack chain to view its graph
            </div>
          )}
        </div>
      </div>

      {selectedChain && selectedChain.stages && selectedChain.stages.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-glass)', borderRadius: 'var(--radius-xl, 20px)', border: '1px solid var(--border-color)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600 }}>Attack Timeline</h3>
          <div style={{ position: 'relative', borderLeft: '2px solid var(--border-color)', marginLeft: '12px', paddingBottom: '24px' }}>
            {selectedChain.stages.map((stage, idx) => {
              let dotColor = 'var(--severity-low)';
              if (stage.severity === 'critical') dotColor = 'var(--severity-critical)';
              else if (stage.severity === 'high') dotColor = 'var(--severity-high)';
              else if (stage.severity === 'medium') dotColor = 'var(--severity-medium)';

              return (
                <div key={idx} style={{ position: 'relative', paddingLeft: '32px', marginBottom: '24px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-7px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: dotColor,
                    border: '2px solid var(--bg-primary)'
                  }} />
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md, 10px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>{stage.type}</span>
                      <SeverityBadge severity={stage.severity} />
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{new Date(stage.timestamp).toLocaleString()}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{stage.description}</div>
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
