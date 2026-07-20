import { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import ChartCard from '../components/ChartCard';
import LiveEventFeed from '../components/LiveEventFeed';
import { api } from '../services/api';
import { Activity, AlertTriangle, Globe, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#111827',
        border: '1px solid rgba(148,163,184,0.1)',
        borderRadius: '8px',
        padding: '12px',
        color: 'white'
      }}>
        <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color || '#fff', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color || '#fff' }}></span>
            <span>{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#10b981'
};

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await api.getEvents();
        const threatsData = await api.getThreats();
        setEvents(eventsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const timelineData = events.slice(-30).map((e, i) => ({
    time: `Day ${i+1}`,
    count: Math.floor(Math.random() * 50) + 10
  }));

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <Header title="Executive Overview" subtitle="Real-time security operations center monitoring" />
      
      <div className="stats-grid">
        <StatsCard icon={Activity} title="Total Events" value={totalEvents.toLocaleString()} color="#06b6d4" change="+12.5" changeLabel="vs last week" />
        <StatsCard icon={AlertTriangle} title="Critical Incidents" value={criticalIncidents.toLocaleString()} color="#ef4444" change="-3.2" />
        <StatsCard icon={Globe} title="Suspicious IPs" value={uniqueMaliciousIps.toLocaleString()} color="#f97316" change="+8.1" />
        <StatsCard icon={Shield} title="ML Detections" value={mlDetections.toLocaleString()} color="#8b5cf6" change="+15.3" />
      </div>

      <div className="grid-2" style={{ marginTop: '24px' }}>
        <ChartCard title="Severity Distribution">
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="white" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {totalEvents}
                </text>
                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fill="var(--text-muted)" style={{ fontSize: '12px' }}>
                  Total Events
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        
        <ChartCard title="Live Security Feed">
          <div style={{ height: '300px', overflowY: 'auto' }}>
            <LiveEventFeed events={events.slice(0, 10)} />
          </div>
        </ChartCard>
      </div>

      <div style={{ marginTop: '24px' }}>
        <ChartCard title="Security Events Timeline" subtitle="Last 30 days">
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
