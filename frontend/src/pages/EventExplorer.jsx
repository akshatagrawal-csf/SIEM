import { useState, useEffect } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import SeverityBadge from '../components/SeverityBadge';
import { api } from '../services/api';
import { Search, Filter } from 'lucide-react';

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
    let color = '#10b981';
    if (score > 80) color = '#ef4444';
    else if (score > 60) color = '#f97316';
    else if (score > 30) color = '#f59e0b';
    return { color, fontWeight: 'bold' };
  };

  const columns = [
    { 
      key: 'timestamp', 
      label: 'Timestamp', 
      render: (val) => new Date(val).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    },
    { key: 'source_ip', label: 'Source IP', render: (val) => <span style={{ fontFamily: 'monospace' }}>{val}</span> },
    { key: 'destination_ip', label: 'Dest IP', render: (val) => <span style={{ fontFamily: 'monospace' }}>{val}</span> },
    { key: 'username', label: 'Username' },
    { key: 'event_type', label: 'Event Type', render: (val) => <span className="tag">{val}</span> },
    { key: 'severity', label: 'Severity', render: (val) => <SeverityBadge severity={val} /> },
    { key: 'risk_score', label: 'Risk Score', render: (val) => <span style={getRiskScoreStyle(val)}>{val}</span> },
    { key: 'label', label: 'Label', render: (val) => <span className="tag">{val}</span> }
  ];

  return (
    <div>
      <Header title="Event Explorer" subtitle="Search, filter, and investigate security events" />
      
      <div className="filter-bar" style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="data-table-search" 
            placeholder="Search by IP, username, or event type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '40px' }}
          />
        </div>
        
        <select className="filter-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select className="filter-select" value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)}>
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

      <div style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
        Showing {filteredEvents.length} of {events.length} events
      </div>

      <div className="data-table-container">
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : (
          <DataTable data={filteredEvents} columns={columns} />
        )}
      </div>
    </div>
  );
}
