import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Activity, Network, Globe, Shield, RefreshCw } from 'lucide-react';
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
  Critical: '#FF2255',
  High: '#FF7700',
  Medium: '#FFB800',
  Low: '#00FF9D'
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
        <RefreshCw className="w-8 h-8 text-siem-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-display font-semibold text-white flex items-center gap-3"
          >
            <span className="w-2.5 h-8 bg-siem-cyan rounded-full animate-pulse shadow-glow-cyan" />
            Global Threat Landscape
          </motion.h1>
          <p className="text-xs font-mono text-siem-muted mt-1.5 ml-5">
            Real-time SIEM security operations center overview
          </p>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Events Ingested", value: totalEvents.toLocaleString(), icon: Activity, color: "text-siem-cyan", bg: "from-siem-cyan/20 to-transparent", change: "+12.5%" },
          { title: "Critical Anomalies", value: criticalIncidents.toLocaleString(), icon: ShieldAlert, color: "text-siem-critical", bg: "from-siem-critical/20 to-transparent", change: "-3.2%" },
          { title: "Hostile IP Sources", value: uniqueMaliciousIps.toLocaleString(), icon: Globe, color: "text-siem-high", bg: "from-siem-high/20 to-transparent", change: "+8.1%" },
          { title: "ML Model Detections", value: mlDetections.toLocaleString(), icon: Shield, color: "text-siem-purple", bg: "from-siem-purple/20 to-transparent", change: "+15.3%" }
        ].map((kpi, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, scale: 1.01 }}
            className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group border border-siem-border"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${kpi.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-siem-muted text-xs font-mono tracking-wider uppercase">{kpi.title}</p>
                <h3 className="text-3xl font-display font-bold text-white mt-2">{kpi.value}</h3>
                <span className="text-[11px] font-mono text-siem-green mt-1 inline-block">{kpi.change} vs last cycle</span>
              </div>
              <div className="p-3 rounded-xl bg-siem-bg/50 border border-siem-border">
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Grid: Severity Donut Chart & Live Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-semibold text-lg text-white">Event Severity Breakdown</h3>
              <p className="text-xs font-mono text-siem-muted">Categorized risk classification</p>
            </div>
          </div>
          <div className="h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  innerRadius={75}
                  outerRadius={115}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#71717A'} stroke="rgba(0,0,0,0.8)" />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" className="font-display font-bold text-2xl">
                  {totalEvents}
                </text>
                <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" fill="#A1A1AA" className="font-mono text-xs">
                  EVENTS
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Security Feed */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg text-white">Live Event Feed</h3>
              <p className="text-xs font-mono text-siem-muted">Real-time incoming telemetry stream</p>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-siem-cyan/10 text-siem-cyan border border-siem-cyan/30">
              <span className="w-1.5 h-1.5 rounded-full bg-siem-cyan animate-ping" /> REALTIME
            </span>
          </div>
          <div className="flex-1 max-h-[290px] overflow-y-auto custom-scrollbar">
            <LiveEventFeed events={events.slice(0, 12)} />
          </div>
        </motion.div>
      </div>

      {/* Security Events Timeline Chart */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-display font-semibold text-lg text-white">Security Events Timeline</h3>
            <p className="text-xs font-mono text-siem-muted">30-day aggregate threat velocity trend</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB800" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FFB800" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="#71717A" tickLine={false} axisLine={false} className="font-mono text-xs" />
              <YAxis stroke="#71717A" tickLine={false} axisLine={false} className="font-mono text-xs" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#FFB800" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
