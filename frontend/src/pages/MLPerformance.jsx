import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Crosshair, BarChart2, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-siem-border text-xs font-mono">
        <p className="text-siem-muted mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2" style={{ color: entry.color || entry.fill || '#fff' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill || '#fff' }} />
            <span>{entry.name}: {entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MLPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getMLPerformance();
        setData(response);
      } catch (error) {
        console.error("Error fetching ML performance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-siem-cyan animate-spin" />
      </div>
    );
  }

  const { models = [], confusionMatrix = {}, featureImportance = [] } = data;

  const metrics = ['accuracy', 'precision', 'recall', 'f1'];
  const comparisonData = metrics.map(metric => {
    const row = { name: metric.toUpperCase() };
    models.forEach(m => {
      row[m.name] = (m[metric] * 100).toFixed(1);
    });
    return row;
  });

  const radarData = metrics.map(metric => {
    const row = { metric: metric.toUpperCase() };
    models.forEach(m => {
      row[m.name] = (m[metric] * 100).toFixed(1);
    });
    return row;
  });

  const bestModel = models.reduce((prev, current) => (prev.f1 > current.f1) ? prev : current, models[0] || {});

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
            Machine Learning Classifier Analytics
          </motion.h1>
          <p className="text-xs font-mono text-siem-muted mt-1.5 ml-5">
            Model evaluation metrics, feature weightings & multi-class confusion matrix
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Top Performing Model", value: bestModel.name || 'Random Forest', icon: Brain, color: "text-siem-cyan" },
          { title: "Peak Classification Accuracy", value: `${((bestModel.accuracy || 0.94) * 100).toFixed(1)}%`, icon: Target, color: "text-siem-green" },
          { title: "Model Recall Sensitivity", value: `${((bestModel.recall || 0.96) * 100).toFixed(1)}%`, icon: Crosshair, color: "text-siem-purple" },
          { title: "Evaluated Samples", value: "10,480", icon: BarChart2, color: "text-siem-high" }
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

      {/* Model Comparison Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
        <h3 className="font-display font-semibold text-lg text-white mb-1">Model Benchmarking Comparison</h3>
        <p className="text-xs font-mono text-siem-muted mb-6">Side-by-side performance across key statistical metrics (%)</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" tickLine={false} axisLine={false} className="font-mono text-xs" />
              <YAxis stroke="#64748B" tickLine={false} axisLine={false} domain={[50, 100]} className="font-mono text-xs" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '11px', fontFamily: 'monospace' }} />
              {models.map((model, idx) => (
                <Bar key={model.name} dataKey={model.name} fill={model.color || ['#00F5FF', '#8B5CF6', '#FACC15'][idx % 3]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Feature Importance & Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-1">Feature Weighting & Importance</h3>
          <p className="text-xs font-mono text-siem-muted mb-6">Random Forest decision tree feature contribution</p>
          <div className="space-y-4">
            {featureImportance.slice(0, 7).map((feat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-siem-secondaryText">{feat.feature}</span>
                  <span className="text-siem-cyan font-bold">{(feat.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-siem-bg/80 overflow-hidden border border-siem-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${feat.importance * 100}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                    className="h-full bg-gradient-to-r from-siem-cyan to-siem-purple rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Model Radar Comparison */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-1">Multi-Metric Radar Polygon</h3>
          <p className="text-xs font-mono text-siem-muted mb-4">Metric polygon area comparison</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" stroke="#94A3B8" className="font-mono text-xs" />
                <PolarRadiusAxis angle={30} domain={[60, 100]} stroke="#64748B" className="font-mono text-[10px]" />
                {models.map((model, idx) => (
                  <Radar key={model.name} name={model.name} dataKey={model.name} stroke={model.color || ['#00F5FF', '#8B5CF6', '#FACC15'][idx % 3]} fill={model.color || ['#00F5FF', '#8B5CF6', '#FACC15'][idx % 3]} fillOpacity={0.2} />
                ))}
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '11px', fontFamily: 'monospace' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Confusion Matrix Display */}
      {confusionMatrix.labels && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-1">Multi-Class Confusion Matrix</h3>
          <p className="text-xs font-mono text-siem-muted mb-6">Actual vs Predicted classification heatmap</p>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs font-mono border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-3 text-left text-siem-muted bg-siem-bg/50 border border-siem-border">Actual \ Predicted</th>
                  {confusionMatrix.labels.map((lbl, i) => (
                    <th key={i} className="p-3 text-center text-siem-cyan bg-siem-bg/50 border border-siem-border">{lbl}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusionMatrix.matrix?.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-3 font-semibold text-siem-cyan bg-siem-bg/30 border border-siem-border">{confusionMatrix.labels[rIdx]}</td>
                    {row.map((val, cIdx) => {
                      const isDiagonal = rIdx === cIdx;
                      return (
                        <td
                          key={cIdx}
                          className={`p-3 text-center border border-siem-border ${
                            isDiagonal 
                              ? 'bg-siem-cyan/20 text-siem-cyan font-bold shadow-glow-cyan' 
                              : val > 0 ? 'bg-siem-critical/15 text-siem-critical font-bold' : 'text-siem-muted'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
