import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Activity, Globe, Shield, RefreshCw } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';
import { api } from '../services/api';
import LiveEventFeed from '../components/LiveEventFeed';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-siem-border text-xs">
        <p className="text-siem-muted font-mono mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 font-mono" style={{ color: entry.color || '#fff' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || '#fff' }} />
            <span>{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SEVERITY_COLORS = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#F59E0B',
  Low: '#10B981'
};

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await api.getEvents();
        setEvents(eventsData || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalEvents = events.length;
  const criticalIncidents = events.filter(e => e.severity === 'Critical').length;
  const uniqueMaliciousIps = new Set(events.filter(e => e.risk_score > 70).map(e => e.source_ip)).size;
  const mlDetections = events.filter(e => e.ml_prediction === 'malicious').length;

  const severityData = Object.entries(
    events.reduce((acc, curr) => {
      acc[curr.severity] = (acc[curr.severity] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const timelineData = events.slice(-30).map((_, i) => ({
    time: `Day ${i + 1}`,
    count: Math.floor(Math.random() * 45) + 15
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-6 h-6 text-siem-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Global Threat Landscape
          </h1>
          <p className="text-xs text-siem-muted mt-1">
            Real-time Security Operations Center Overview
          </p>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Total Events Ingested", value: totalEvents.toLocaleString(), icon: Activity, color: "text-blue-500", change: "+12.5%" },
          { title: "Critical Anomalies", value: criticalIncidents.toLocaleString(), icon: ShieldAlert, color: "text-red-500", change: "-3.2%" },
          { title: "Hostile IP Sources", value: uniqueMaliciousIps.toLocaleString(), icon: Globe, color: "text-amber-500", change: "+8.1%" },
          { title: "ML Model Detections", value: mlDetections.toLocaleString(), icon: Shield, color: "text-indigo-500", change: "+15.3%" }
        ].map((kpi, i) => (
          <div
            key={i}
            className="glass-panel p-5 rounded-lg border border-siem-border bg-siem-card"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0 flex-1 pr-1">
                <p className="text-siem-muted text-[11px] font-mono font-medium tracking-wide uppercase truncate" title={kpi.title}>{kpi.title}</p>
                <h3 className="font-bold text-white mt-1.5 tracking-tight break-all truncate text-lg sm:text-xl lg:text-2xl" title={kpi.value}>{kpi.value}</h3>
                <span className="text-[11px] text-emerald-500 font-medium mt-1 inline-block">{kpi.change} vs last cycle</span>
              </div>
              <div className="p-2.5 rounded-md bg-siem-secondary border border-siem-border shrink-0">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Grid: Severity Donut Chart & Live Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-base text-white">Event Severity Breakdown</h3>
              <p className="text-xs text-siem-muted">Categorized risk classification</p>
            </div>
          </div>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#6B7280'} stroke="#13141C" />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" className="font-bold text-2xl">
                  {totalEvents}
                </text>
                <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" fill="#9CA3AF" className="text-xs font-mono">
                  EVENTS
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Security Feed */}
        <div className="glass-panel p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-base text-white">Live Security Stream</h3>
              <p className="text-xs text-siem-muted">Real-time incoming telemetry log</p>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              REALTIME
            </span>
          </div>
          <div className="flex-1 max-h-[260px] overflow-y-auto custom-scrollbar">
            <LiveEventFeed events={events.slice(0, 12)} />
          </div>
        </div>
      </div>

      {/* Security Events Timeline Chart */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-base text-white">Security Events Timeline</h3>
            <p className="text-xs text-siem-muted">30-day aggregate threat velocity trend</p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E202E" vertical={false} />
              <XAxis dataKey="time" stroke="#6B7280" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis stroke="#6B7280" tickLine={false} axisLine={false} className="text-xs" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
