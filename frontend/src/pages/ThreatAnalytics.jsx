import { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import ChartCard from '../components/ChartCard';
import { api } from '../services/api';
import { Target, Crosshair, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

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
          <div key={index} style={{ color: entry.color || entry.fill || '#fff', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color || entry.fill || '#fff' }}></span>
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

const ATTACK_TYPE_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];

export default function ThreatAnalytics() {
  const [events, setEvents] = useState([]);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, threatsData] = await Promise.all([
          api.getEvents(),
          api.getThreats()
        ]);
        setEvents(eventsData || []);
        setThreats(threatsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const maliciousEvents = events.filter(e => e.label !== 'Normal' && e.label !== 'Benign' && e.severity !== 'Low');
  
  const totalThreats = maliciousEvents.length;
  
  const attackTypes = maliciousEvents.map(e => e.event_type);
  const mostCommonAttack = attackTypes.length > 0 ? attackTypes.sort((a,b) =>
    attackTypes.filter(v => v===a).length - attackTypes.filter(v => v===b).length
  ).pop() : 'N/A';

  const attackerIps = maliciousEvents.map(e => e.source_ip);
  const topAttackerIp = attackerIps.length > 0 ? attackerIps.sort((a,b) =>
    attackerIps.filter(v => v===a).length - attackerIps.filter(v => v===b).length
  ).pop() : 'N/A';

  const avgRiskScore = events.length > 0 ? (events.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / events.length).toFixed(1) : 0;

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

  // Mock area chart data
  const timelineData = Array.from({length: 14}).map((_, i) => ({
    name: `Day ${i+1}`,
    Critical: Math.floor(Math.random() * 5),
    High: Math.floor(Math.random() * 10),
    Medium: Math.floor(Math.random() * 20),
    Low: Math.floor(Math.random() * 30)
  }));

  const topIpsData = Object.entries(
    attackerIps.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {})
  ).map(([ip, count]) => ({ ip, count })).sort((a, b) => b.count - a.count).slice(0, 10);

  // Mock port data
  const portData = [
    { port: '443', count: 450 },
    { port: '80', count: 320 },
    { port: '22', count: 210 },
    { port: '3389', count: 150 },
    { port: '445', count: 90 }
  ];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <Header title="Threat Analytics" subtitle="Attack patterns, trends, and threat intelligence" />
      
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatsCard icon={Target} title="Total Threats" value={totalThreats.toLocaleString()} color="#ef4444" />
        <StatsCard icon={Activity} title="Most Common Attack" value={mostCommonAttack} color="#f97316" />
        <StatsCard icon={Crosshair} title="Top Attacker IP" value={topAttackerIp} color="#06b6d4" />
        <StatsCard icon={TrendingUp} title="Avg Risk Score" value={avgRiskScore} color="#f59e0b" />
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <ChartCard title="Attacks by Severity">
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Attack Type Distribution">
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attackTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {attackTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ATTACK_TYPE_COLORS[index % ATTACK_TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'var(--text-muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <ChartCard title="Threat Timeline">
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SEVERITY_COLORS.Critical} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={SEVERITY_COLORS.Critical} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SEVERITY_COLORS.High} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={SEVERITY_COLORS.High} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SEVERITY_COLORS.Medium} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={SEVERITY_COLORS.Medium} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SEVERITY_COLORS.Low} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={SEVERITY_COLORS.Low} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="Low" stackId="1" stroke={SEVERITY_COLORS.Low} fill="url(#colorLow)" />
                <Area type="monotone" dataKey="Medium" stackId="1" stroke={SEVERITY_COLORS.Medium} fill="url(#colorMedium)" />
                <Area type="monotone" dataKey="High" stackId="1" stroke={SEVERITY_COLORS.High} fill="url(#colorHigh)" />
                <Area type="monotone" dataKey="Critical" stackId="1" stroke={SEVERITY_COLORS.Critical} fill="url(#colorCritical)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid-2">
        <ChartCard title="Top Attacking IPs">
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topIpsData} margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis dataKey="ip" type="category" stroke="#64748b" tickLine={false} axisLine={false} width={100} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Most Targeted Ports">
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="port" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
