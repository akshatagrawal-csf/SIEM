import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Crosshair, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
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
            <span>{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SEVERITY_COLORS = {
  Critical: '#FF2255',
  High: '#FF7700',
  Medium: '#FFB800',
  Low: '#00FF9D'
};

const ATTACK_TYPE_COLORS = ['#FFB800', '#00FF9D', '#FF7700', '#FF2255', '#E040FB', '#10B981'];

export default function ThreatAnalytics() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await api.getEvents();
        setEvents(eventsData || []);
      } catch (error) {
        console.error("Error fetching threat analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const maliciousEvents = events.filter(e => e.label !== 'Normal' && e.severity !== 'Low');
  const totalThreats = maliciousEvents.length;
  
  const attackTypes = maliciousEvents.map(e => e.event_type);
  const mostCommonAttack = attackTypes.length > 0 
    ? attackTypes.sort((a,b) => attackTypes.filter(v => v===a).length - attackTypes.filter(v => v===b).length).pop() 
    : 'N/A';

  const attackerIps = maliciousEvents.map(e => e.source_ip);
  const topAttackerIp = attackerIps.length > 0 
    ? attackerIps.sort((a,b) => attackerIps.filter(v => v===a).length - attackerIps.filter(v => v===b).length).pop() 
    : 'N/A';

  const avgRiskScore = events.length > 0 
    ? (events.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / events.length).toFixed(1) 
    : 0;

  const severityData = Object.entries(
    events.reduce((acc, curr) => {
      acc[curr.severity] = (acc[curr.severity] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const attackTypeData = Object.entries(
    maliciousEvents.reduce((acc, curr) => {
      acc[curr.event_type] = (acc[curr.event_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const timelineData = Array.from({ length: 14 }).map((_, i) => ({
    name: `Day ${i + 1}`,
    Critical: Math.floor(Math.random() * 5) + 1,
    High: Math.floor(Math.random() * 10) + 2,
    Medium: Math.floor(Math.random() * 20) + 5,
    Low: Math.floor(Math.random() * 30) + 10
  }));

  const topIpsData = Object.entries(
    attackerIps.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {})
  ).map(([ip, count]) => ({ ip, count })).sort((a, b) => b.count - a.count).slice(0, 10);

  const portData = [
    { port: '443 (HTTPS)', count: 450 },
    { port: '80 (HTTP)', count: 320 },
    { port: '22 (SSH)', count: 210 },
    { port: '3389 (RDP)', count: 150 },
    { port: '445 (SMB)', count: 90 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-siem-cyan animate-spin" />
      </div>
    );
  }

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
            Threat Analytics & Intelligence
          </motion.h1>
          <p className="text-xs font-mono text-siem-muted mt-1.5 ml-5">
            Aggregated threat intelligence, attack vectors & port targeting
          </p>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Flagged Threats", value: totalThreats.toLocaleString(), icon: Target, color: "text-siem-critical" },
          { title: "Most Common Vector", value: mostCommonAttack, icon: Activity, color: "text-siem-orange" },
          { title: "Top Attacker Source", value: topAttackerIp, icon: Crosshair, color: "text-siem-cyan" },
          { title: "Average Risk Score", value: avgRiskScore, icon: TrendingUp, color: "text-siem-medium" }
        ].map((kpi, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, scale: 1.01 }}
            className="glass-panel glass-panel-hover p-6 rounded-2xl border border-siem-border"
          >
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

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-1">Attacks by Severity</h3>
          <p className="text-xs font-mono text-siem-muted mb-6">Distribution across threat levels</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#71717A" tickLine={false} axisLine={false} className="font-mono text-xs" />
                <YAxis stroke="#71717A" tickLine={false} axisLine={false} className="font-mono text-xs" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#71717A'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-1">Attack Type Distribution</h3>
          <p className="text-xs font-mono text-siem-muted mb-6">Classification breakdown of detected anomalies</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attackTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {attackTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={ATTACK_TYPE_COLORS[index % ATTACK_TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#A1A1AA', fontSize: '11px', fontFamily: 'monospace' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Stacked Threat Timeline */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6">
        <h3 className="font-display font-semibold text-lg text-white mb-1">Stacked Threat Velocity Timeline</h3>
        <p className="text-xs font-mono text-siem-muted mb-6">14-day stacked severity progression</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#71717A" tickLine={false} axisLine={false} className="font-mono text-xs" />
              <YAxis stroke="#71717A" tickLine={false} axisLine={false} className="font-mono text-xs" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#A1A1AA', fontSize: '11px', fontFamily: 'monospace' }} />
              <Area type="monotone" dataKey="Low" stackId="1" stroke={SEVERITY_COLORS.Low} fill={SEVERITY_COLORS.Low} fillOpacity={0.3} />
              <Area type="monotone" dataKey="Medium" stackId="1" stroke={SEVERITY_COLORS.Medium} fill={SEVERITY_COLORS.Medium} fillOpacity={0.3} />
              <Area type="monotone" dataKey="High" stackId="1" stroke={SEVERITY_COLORS.High} fill={SEVERITY_COLORS.High} fillOpacity={0.4} />
              <Area type="monotone" dataKey="Critical" stackId="1" stroke={SEVERITY_COLORS.Critical} fill={SEVERITY_COLORS.Critical} fillOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Charts Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-1">Top Attacking IP Addresses</h3>
          <p className="text-xs font-mono text-siem-muted mb-6">Most prolific threat originators</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topIpsData} margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#71717A" tickLine={false} axisLine={false} className="font-mono text-xs" />
                <YAxis dataKey="ip" type="category" stroke="#FFB800" tickLine={false} axisLine={false} className="font-mono text-xs" width={90} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#FFB800" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-1">Most Targeted Network Ports</h3>
          <p className="text-xs font-mono text-siem-muted mb-6">Destination service targeting analysis</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="port" stroke="#71717A" tickLine={false} axisLine={false} className="font-mono text-xs" />
                <YAxis stroke="#71717A" tickLine={false} axisLine={false} className="font-mono text-xs" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#00FF9D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
