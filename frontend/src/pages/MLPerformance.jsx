import React, { useState, useEffect } from 'react';
import { Brain, Target, Crosshair, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { api } from '../services/api';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import ChartCard from '../components/ChartCard';

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
    return <div style={{ color: 'var(--text-primary)', padding: '24px' }}>Loading...</div>;
  }

  const { models = [], confusionMatrix = {}, featureImportance = [] } = data;

  // Prepare data for model comparison BarChart
  const metrics = ['accuracy', 'precision', 'recall', 'f1'];
  const comparisonData = metrics.map(metric => {
    const row = { name: metric.charAt(0).toUpperCase() + metric.slice(1) };
    models.forEach(m => {
      row[m.name] = m[metric] * 100;
    });
    return row;
  });

  // Prepare data for Radar Chart
  const radarData = metrics.map(metric => {
    const row = { metric: metric.charAt(0).toUpperCase() + metric.slice(1) };
    models.forEach(m => {
      row[m.name] = m[metric] * 100;
    });
    return row;
  });

  const tooltipStyle = {
    backgroundColor: '#111827',
    border: '1px solid rgba(148,163,184,0.1)',
    borderRadius: '8px',
    color: '#f1f5f9'
  };

  const getIntensityColor = (val, max) => {
    // scale from #1e293b to #06b6d4
    // R: 30->6, G: 41->182, B: 59->212
    const ratio = Math.min(1, val / (max || 1));
    const r = Math.round(30 + ratio * (6 - 30));
    const g = Math.round(41 + ratio * (182 - 41));
    const b = Math.round(59 + ratio * (212 - 59));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const maxCmVal = confusionMatrix.matrix ? Math.max(...confusionMatrix.matrix.flat()) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', color: 'var(--text-primary)' }}>
      <Header title="ML Model Performance" subtitle="Machine learning model evaluation and comparison" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatsCard title="Best Model" value="Random Forest" icon={Brain} color="#8b5cf6" />
        <StatsCard title="Best Accuracy" value="94.3%" icon={Target} color="#06b6d4" />
        <StatsCard title="Best Recall" value="96.7%" icon={Crosshair} color="#10b981" />
        <StatsCard title="Total Predictions" value="1,284,500" icon={BarChart2} color="#f59e0b" />
      </div>

      <ChartCard title="Model Comparison">
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {models.map(model => (
                <Bar key={model.name} dataKey={model.name} fill={model.color} radius={[4, 4, 0, 0]} barSize={40} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <ChartCard title="Confusion Matrix">
          <div style={{ overflowX: 'auto', padding: '12px 0' }}>
            {confusionMatrix.labels && confusionMatrix.matrix && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Actual \\ Pred</th>
                    {confusionMatrix.labels.map(lbl => (
                      <th key={lbl} style={{ padding: '8px', color: 'var(--text-secondary)' }}>{lbl}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {confusionMatrix.labels.map((rowLabel, i) => (
                    <tr key={rowLabel}>
                      <th style={{ padding: '8px', color: 'var(--text-secondary)', textAlign: 'left' }}>{rowLabel}</th>
                      {confusionMatrix.matrix[i].map((val, j) => {
                        const bg = getIntensityColor(val, maxCmVal);
                        const isLight = val > maxCmVal * 0.5;
                        return (
                          <td key={j} style={{
                            padding: '12px 8px',
                            backgroundColor: bg,
                            color: isLight ? '#fff' : 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            fontWeight: isLight ? 'bold' : 'normal'
                          }}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Feature Importance">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '12px' }}>
            {featureImportance.map(feat => (
              <div key={feat.feature} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>{feat.feature}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{(feat.importance * 100).toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${feat.importance * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Model Radar Comparison">
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b' }} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                {models.map(model => (
                  <Radar key={model.name} name={model.name} dataKey={model.name} stroke={model.color} fill={model.color} fillOpacity={0.1} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Detailed Model Metrics">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Model</th>
                  {metrics.map(m => (
                    <th key={m} style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {models.map(model => (
                  <tr key={model.name}>
                    <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: model.color }} />
                        <span style={{ fontWeight: 600 }}>{model.name}</span>
                      </div>
                    </td>
                    {metrics.map(m => (
                      <td key={m} style={{ padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span>{(model[m] * 100).toFixed(1)}%</span>
                          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px' }}>
                            <div style={{ width: `${model[m] * 100}%`, height: '100%', backgroundColor: model.color, borderRadius: '2px' }} />
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
