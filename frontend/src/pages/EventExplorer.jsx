import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, Download, RotateCcw, X } from 'lucide-react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import SeverityBadge from '../components/SeverityBadge';

export default function EventExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeQuery, setActiveQuery] = useState(initialSearch);
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

  useEffect(() => {
    const param = searchParams.get('search');
    if (param !== null) {
      setSearchTerm(param);
      setActiveQuery(param);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveQuery(searchTerm);
    if (searchTerm) {
      setSearchParams({ search: searchTerm });
    } else {
      setSearchParams({});
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveQuery('');
    setSeverityFilter('All');
    setEventTypeFilter('All');
    setSearchParams({});
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
    const query = activeQuery.toLowerCase().trim();
    const matchesSearch = query === '' || 
      event.source_ip?.toLowerCase().includes(query) ||
      event.destination_ip?.toLowerCase().includes(query) ||
      event.username?.toLowerCase().includes(query) ||
      event.event_type?.toLowerCase().includes(query) ||
      event.label?.toLowerCase().includes(query);
      
    const matchesSeverity = severityFilter === 'All' || event.severity === severityFilter;
    const matchesEventType = eventTypeFilter === 'All' || event.event_type === eventTypeFilter;

    return matchesSearch && matchesSeverity && matchesEventType;
  });

  const getRiskScoreStyle = (score) => {
    let color = '#CCFF00';
    if (score > 80) color = '#FF0033';
    else if (score > 60) color = '#FFB800';
    else if (score > 30) color = '#FFD400';
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
    { key: 'source_ip', label: 'Source IP', render: (val) => <span className="font-mono text-xs text-siem-orange font-bold">{val}</span> },
    { key: 'destination_ip', label: 'Dest IP', render: (val) => <span className="font-mono text-xs text-siem-secondaryText">{val}</span> },
    { key: 'username', label: 'User', render: (val) => <span className="font-mono text-xs text-white font-medium">{val}</span> },
    { key: 'event_type', label: 'Event Type', render: (val) => <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-siem-bgSecondary border border-siem-border text-siem-secondaryText">{val}</span> },
    { key: 'severity', label: 'Severity', render: (val) => <SeverityBadge severity={val} /> },
    { key: 'risk_score', label: 'Risk Score', render: (val) => <span className="font-mono text-xs" style={getRiskScoreStyle(val)}>{val}</span> },
    { key: 'label', label: 'Classification', render: (val) => <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-siem-orange/10 border border-siem-orange/20 text-siem-orange font-bold">{val}</span> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Security Event Explorer
          </h1>
          <p className="text-xs text-siem-muted mt-1 font-mono">
            Query, filter, and inspect raw enterprise telemetry logs
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-mono font-bold bg-siem-orange/10 text-siem-orange border border-siem-orange/30 hover:bg-siem-orange/20 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-siem-orange/10 border border-siem-orange/30 text-siem-orange text-xs font-mono rounded flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-siem-orange hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Bar with Working Search Form & Search Button */}
      <form onSubmit={handleSearchSubmit} className="glass-panel p-4 flex flex-col md:flex-row gap-3 items-center bg-siem-card border border-siem-border rounded-lg">
        <div className="relative flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-siem-muted" />
            <input 
              type="text" 
              placeholder="Search by IP, Username, Event Type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs font-mono bg-siem-bg border border-siem-border rounded text-white placeholder-siem-muted focus:outline-none focus:border-siem-orange transition-colors"
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => { setSearchTerm(''); setActiveQuery(''); setSearchParams({}); }} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-siem-muted hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          {/* Explicit Working Search Button */}
          <button
            type="submit"
            className="px-4 py-1.5 rounded text-xs font-mono font-black bg-siem-orange text-black hover:bg-orange-500 transition-colors uppercase tracking-wider shrink-0"
          >
            Search
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-siem-bg border border-siem-border rounded text-white outline-none focus:border-siem-orange"
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
            className="px-3 py-1.5 text-xs font-mono bg-siem-bg border border-siem-border rounded text-white outline-none focus:border-siem-orange"
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
            type="button"
            onClick={handleResetFilters}
            className="p-1.5 rounded bg-siem-bgSecondary border border-siem-border text-siem-muted hover:text-white transition-colors shrink-0"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Results Count Banner */}
      <div className="flex justify-between items-center text-xs font-mono text-siem-muted px-1">
        <span>Showing <strong className="text-siem-orange">{filteredEvents.length}</strong> of {events.length} logs</span>
        {activeQuery && (
          <span>Filter active: <strong className="text-white">"{activeQuery}"</strong></span>
        )}
      </div>

      {/* Data Table */}
      <div className="glass-panel overflow-hidden border border-siem-border rounded-lg bg-siem-card">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <RefreshCw className="w-6 h-6 text-siem-orange animate-spin" />
          </div>
        ) : (
          <DataTable data={filteredEvents} columns={columns} searchable={false} />
        )}
      </div>
    </div>
  );
}
