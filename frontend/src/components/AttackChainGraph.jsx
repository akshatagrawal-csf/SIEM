import React, { useMemo } from 'react';
import { ReactFlow, ReactFlowProvider, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SeverityBadge from './SeverityBadge';

const CustomNode = ({ data }) => {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: `1px solid var(--border-color)`,
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      minWidth: '250px',
      color: 'var(--text-primary)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Stage {data.stageNumber}</span>
        <SeverityBadge severity={data.severity} />
      </div>
      <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{data.type}</h4>
      <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{data.description}</p>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
        {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const AttackChainGraphContent = ({ chain }) => {
  const { nodes, edges } = useMemo(() => {
    if (!chain || !chain.stages || chain.stages.length === 0) {
      return { nodes: [], edges: [] };
    }

    const newNodes = [];
    const newEdges = [];
    const spacingY = 150;

    chain.stages.forEach((stage, index) => {
      const nodeId = `node-${index}`;
      
      newNodes.push({
        id: nodeId,
        type: 'custom',
        position: { x: 250, y: index * spacingY },
        data: {
          stageNumber: stage.stage || index + 1,
          type: stage.type,
          severity: stage.severity,
          description: stage.description,
          timestamp: stage.timestamp,
        },
      });

      if (index > 0) {
        newEdges.push({
          id: `e-${index-1}-${index}`,
          source: `node-${index-1}`,
          target: nodeId,
          animated: true,
          style: { stroke: 'var(--accent-primary)', strokeWidth: 2 },
        });
      }
    });

    return { nodes: newNodes, edges: newEdges };
  }, [chain]);

  if (!chain) {
    return (
      <div className="glass-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Select an attack chain to visualize
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="var(--border-color)" gap={16} />
        <Controls style={{ background: 'var(--bg-secondary)', fill: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
      </ReactFlow>
    </div>
  );
};

const AttackChainGraph = ({ chain }) => {
  return (
    <ReactFlowProvider>
      <AttackChainGraphContent chain={chain} />
    </ReactFlowProvider>
  );
};

export default AttackChainGraph;
