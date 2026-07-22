import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Download, RotateCcw, X } from 'lucide-react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import SeverityBadge from '../components/SeverityBadge';

export default function EventExplorer() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

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

  const handleResetFilters = () => {
    setSearchTerm('');
    setSeverityFilter('All');
    setEventTypeFilter('All');
    setToastMessage('Filters reset to default');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExportCSV = () => {
    if (!filteredEvents.length) return;

    const headers = ["Timestamp", "Source IP", "Destination IP", "Username", "Event Type", "Severity", "Risk Score", "Label"];
    const csvRows = [headers.join(",")];

    filteredEvents.forEach(e => {
      csvRows.push([
        `"${e.timestamp}"`,
        `"${e.source_ip}"`,
        `"${e.destination_ip || ''}"`,
        `"${e.username || ''}"`,
        `"${e.event_type}"`,
        `"${e.severity}"`,
        e.risk_score,
        `"${e.label}"`
      ].join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `siem_events_${Date.now()}.csv`);
    a.click();

    setToastMessage(`Exported ${filteredEvents.length} events to CSV`);
    setTimeout(() => setToastMessage(''), 3000);
  };

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
    { key: 'source_ip', label: 'Source IP', render: (val) => <span className="font-mono text-xs text-blue-400">{val}</span> },
    { key: 'destination_ip', label: 'Dest IP', render: (val) => <span className="font-mono text-xs text-siem-secondaryText">{val}</span> },
    { key: 'username', label: 'User', render: (val) => <span className="font-mono text-xs text-white">{val}</span> },
    { key: 'event_type', label: 'Event Type', render: (val) => <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-siem-secondary border border-siem-border text-siem-secondaryText">{val}</span> },
    { key: 'severity', label: 'Severity', render: (val) => <SeverityBadge severity={val} /> },
    { key: 'risk_score', label: 'Risk Score', render: (val) => <span className="font-mono text-xs" style={getRiskScoreStyle(val)}>{val}</span> },
    { key: 'label', label: 'Classification', render: (val) => <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">{val}</span> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Security Event Explorer
          </h1>
          <p className="text-xs text-siem-muted mt-1">
            Query, filter, and inspect raw enterprise telemetry logs
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono rounded-lg flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-blue-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center bg-siem-card border border-siem-border rounded-lg">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-siem-muted" />
          <input 
            type="text" 
            placeholder="Search by IP, Username, Event Type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs font-mono bg-siem-bg border border-siem-border rounded-md text-white placeholder-siem-muted focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-siem-muted hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-siem-bg border border-siem-border rounded-md text-white outline-none focus:border-blue-500"
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
            className="px-3 py-1.5 text-xs font-mono bg-siem-bg border border-siem-border rounded-md text-white outline-none focus:border-blue-500"
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

          <button
            onClick={handleResetFilters}
            className="p-2 rounded-md bg-siem-secondary border border-siem-border text-siem-muted hover:text-white transition-colors shrink-0"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex justify-between items-center text-xs font-mono text-siem-muted px-1">
        <span>Showing <strong className="text-blue-400">{filteredEvents.length}</strong> of {events.length} logs</span>
      </div>

      {/* Data Table */}
      <div className="glass-panel overflow-hidden border border-siem-border rounded-lg bg-siem-card">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : (
          <DataTable data={filteredEvents} columns={columns} searchable={false} />
        )}
      </div>
    </div>
  );
}
