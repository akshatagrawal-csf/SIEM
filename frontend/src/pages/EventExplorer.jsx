import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import SeverityBadge from '../components/SeverityBadge';

export default function EventExplorer() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.getEvents();
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.source_ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.destination_ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event_type?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSeverity = severityFilter === 'All' || event.severity === severityFilter;
    const matchesEventType = eventTypeFilter === 'All' || event.event_type === eventTypeFilter;

    return matchesSearch && matchesSeverity && matchesEventType;
  });

  const getRiskScoreStyle = (score) => {
    let color = '#10B981';
    if (score > 80) color = '#EF4444';
    else if (score > 60) color = '#F97316';
    else if (score > 30) color = '#FACC15';
    return { color, fontWeight: 'bold' };
  };

  const columns = [
    { 
      key: 'timestamp', 
      label: 'Timestamp', 
      render: (val) => (
        <span className="font-mono text-xs text-siem-secondaryText">
          {new Date(val).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </span>
      )
    },
    { key: 'source_ip', label: 'Source IP', render: (val) => <span className="font-mono text-xs text-siem-cyan">{val}</span> },
    { key: 'destination_ip', label: 'Dest IP', render: (val) => <span className="font-mono text-xs text-siem-secondaryText">{val}</span> },
    { key: 'username', label: 'User', render: (val) => <span className="font-mono text-xs text-white">{val}</span> },
    { key: 'event_type', label: 'Event Type', render: (val) => <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-siem-hover border border-siem-border text-siem-secondaryText">{val}</span> },
    { key: 'severity', label: 'Severity', render: (val) => <SeverityBadge severity={val} /> },
    { key: 'risk_score', label: 'Risk Score', render: (val) => <span className="font-mono text-xs" style={getRiskScoreStyle(val)}>{val}</span> },
    { key: 'label', label: 'Classification', render: (val) => <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-siem-cyan/10 border border-siem-cyan/20 text-siem-cyan">{val}</span> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-display font-semibold text-white flex items-center gap-3"
          >
            <span className="w-2.5 h-8 bg-siem-cyan rounded-full animate-pulse shadow-glow-cyan" />
            Security Event Explorer
          </motion.h1>
          <p className="text-xs font-mono text-siem-muted mt-1.5 ml-5">
            Query, filter, and inspect raw enterprise telemetry logs
          </p>
        </div>
      </header>

      {/* Filter Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-siem-muted" />
          <input 
            type="text" 
            placeholder="Search by IP, Username, Event Type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-mono bg-siem-bg/60 border border-siem-border rounded-xl text-white placeholder-siem-muted focus:outline-none focus:border-siem-cyan/50 transition-all"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-mono bg-siem-bg/60 border border-siem-border rounded-xl text-white outline-none focus:border-siem-cyan/50"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select 
            value={eventTypeFilter} 
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-mono bg-siem-bg/60 border border-siem-border rounded-xl text-white outline-none focus:border-siem-cyan/50"
          >
            <option value="All">All Event Types</option>
            <option value="login_success">login_success</option>
            <option value="login_failure">login_failure</option>
            <option value="file_access">file_access</option>
            <option value="network_connection">network_connection</option>
            <option value="system_alert">system_alert</option>
            <option value="privilege_change">privilege_change</option>
            <option value="data_transfer">data_transfer</option>
          </select>
        </div>
      </motion.div>

      {/* Results Count Banner */}
      <div className="flex justify-between items-center text-xs font-mono text-siem-muted px-2">
        <span>Showing <strong className="text-siem-cyan">{filteredEvents.length}</strong> of {events.length} logs</span>
      </div>

      {/* Data Table */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <RefreshCw className="w-8 h-8 text-siem-cyan animate-spin" />
          </div>
        ) : (
          <DataTable data={filteredEvents} columns={columns} searchable={false} />
        )}
      </motion.div>
    </div>
  );
}
