// src/data/mockData.js

const generateRandomIP = () => {
  const networks = ['10.0.', '192.168.', '172.16.', '45.33.', '104.28.'];
  const net = networks[Math.floor(Math.random() * networks.length)];
  return `${net}${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const users = ['john.doe', 'sarah.chen', 'mike.wilson', 'admin', 'root', 'svc_backup', 'db_admin', 'guest'];
const eventTypes = ['login_success', 'login_failure', 'file_access', 'network_connection', 'system_alert', 'privilege_change', 'data_transfer'];
const labels = ['Normal', 'Brute Force', 'Port Scan', 'Malware', 'Data Exfiltration', 'Suspicious Login', 'Privilege Escalation'];
const protocols = ['TCP', 'UDP', 'SSH', 'HTTP', 'HTTPS', 'FTP', 'DNS', 'SMB', 'RDP'];
const countries = ['US', 'CN', 'RU', 'DE', 'BR', 'IN', 'GB', 'KR', 'Unknown'];
const devices = ['server', 'workstation', 'firewall', 'router', 'database'];

const generateMockEvents = (count) => {
  const events = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const isMalicious = Math.random() > 0.8;
    const label = isMalicious ? labels[Math.floor(Math.random() * (labels.length - 1)) + 1] : 'Normal';
    const severity = label === 'Normal' ? 'Low' : label === 'Data Exfiltration' || label === 'Privilege Escalation' ? 'Critical' : label === 'Brute Force' ? 'High' : 'Medium';
    const riskScore = label === 'Normal' ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 60) + 40;
    
    const timestamp = new Date(now.getTime() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
    
    events.push({
      id: `evt-${10000 + i}`,
      timestamp: timestamp.toISOString(),
      source_ip: generateRandomIP(),
      destination_ip: generateRandomIP(),
      username: users[Math.floor(Math.random() * users.length)],
      event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      login_status: Math.random() > 0.2 ? 'success' : 'failed',
      failed_attempts: label === 'Brute Force' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 3),
      destination_port: [22, 80, 443, 3389, 445, 53, 21][Math.floor(Math.random() * 7)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      bytes_transferred: Math.floor(Math.random() * 1000000),
      device_type: devices[Math.floor(Math.random() * devices.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      alert_type: severity !== 'Low' ? 'Security Alert' : 'Info',
      severity: severity,
      label: label,
      risk_score: riskScore,
      ml_prediction: isMalicious ? 'malicious' : 'normal',
      ml_confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
      rule_triggered: severity !== 'Low' ? `RULE_${Math.floor(Math.random() * 100)}` : null,
      recommendation: severity !== 'Low' ? 'Investigate immediately' : 'Monitor',
      escalation: severity === 'Critical'
    });
  }
  
  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const mockEvents = generateMockEvents(200);

export const mockAttackChains = [
  {
    id: 'chain-1',
    name: 'Advanced Persistent Threat - Internal Server',
    source_ip: '10.0.5.23',
    target_system: '192.168.1.50',
    username: 'svc_backup',
    start_time: '2024-01-15T02:15:00Z',
    end_time: '2024-01-15T04:45:00Z',
    severity: 'Critical',
    risk_score: 95,
    stages: [
      { stage: 1, type: 'Port Scan', timestamp: '2024-01-15T02:15:00Z', description: 'Scanning ports 1-1024 on target', severity: 'Low' },
      { stage: 2, type: 'Brute Force', timestamp: '2024-01-15T03:00:00Z', description: '47 failed SSH login attempts', severity: 'High' },
      { stage: 3, type: 'Suspicious Login', timestamp: '2024-01-15T03:30:00Z', description: 'Successful login from unusual location', severity: 'High' },
      { stage: 4, type: 'Privilege Escalation', timestamp: '2024-01-15T04:00:00Z', description: 'Service account elevated to root', severity: 'Critical' },
      { stage: 5, type: 'Data Exfiltration', timestamp: '2024-01-15T04:45:00Z', description: '2.3GB transferred to external IP', severity: 'Critical' }
    ]
  },
  {
    id: 'chain-2',
    name: 'Ransomware Preparation Sequence',
    source_ip: '45.33.12.9',
    target_system: '10.0.2.11',
    username: 'mike.wilson',
    start_time: '2024-02-10T11:00:00Z',
    end_time: '2024-02-10T14:20:00Z',
    severity: 'Critical',
    risk_score: 92,
    stages: [
      { stage: 1, type: 'Phishing Click', timestamp: '2024-02-10T11:00:00Z', description: 'User clicked malicious link in email', severity: 'Medium' },
      { stage: 2, type: 'Malware Download', timestamp: '2024-02-10T11:05:00Z', description: 'Suspicious executable downloaded', severity: 'High' },
      { stage: 3, type: 'C2 Communication', timestamp: '2024-02-10T11:15:00Z', description: 'Beaconing to known malicious domain', severity: 'Critical' },
      { stage: 4, type: 'Lateral Movement', timestamp: '2024-02-10T14:20:00Z', description: 'SMB scanning across local subnet', severity: 'High' }
    ]
  },
  {
    id: 'chain-3',
    name: 'Insider Threat - Data Hoarding',
    source_ip: '192.168.1.100',
    target_system: '10.0.5.55',
    username: 'sarah.chen',
    start_time: '2024-03-05T09:00:00Z',
    end_time: '2024-03-05T16:00:00Z',
    severity: 'High',
    risk_score: 85,
    stages: [
      { stage: 1, type: 'Anomalous Access', timestamp: '2024-03-05T09:00:00Z', description: 'Accessing projects outside normal scope', severity: 'Low' },
      { stage: 2, type: 'Mass File Read', timestamp: '2024-03-05T14:00:00Z', description: 'Reading 1000+ sensitive files in 1 hour', severity: 'High' },
      { stage: 3, type: 'USB Insertion', timestamp: '2024-03-05T15:30:00Z', description: 'Unregistered USB storage device connected', severity: 'Medium' },
      { stage: 4, type: 'Data Transfer', timestamp: '2024-03-05T16:00:00Z', description: '5GB of data written to external device', severity: 'Critical' }
    ]
  },
  {
    id: 'chain-4',
    name: 'Cloud Infrastructure Compromise',
    source_ip: '104.28.5.12',
    target_system: 'AWS_Console',
    username: 'admin',
    start_time: '2024-04-12T01:00:00Z',
    end_time: '2024-04-12T02:30:00Z',
    severity: 'Critical',
    risk_score: 98,
    stages: [
      { stage: 1, type: 'Credential Stuffing', timestamp: '2024-04-12T01:00:00Z', description: 'Multiple failed logins from new IPs', severity: 'Medium' },
      { stage: 2, type: 'MFA Bypass', timestamp: '2024-04-12T01:45:00Z', description: 'Successful login without MFA token', severity: 'Critical' },
      { stage: 3, type: 'Policy Modification', timestamp: '2024-04-12T02:00:00Z', description: 'Disabling CloudTrail logging', severity: 'Critical' },
      { stage: 4, type: 'Resource Creation', timestamp: '2024-04-12T02:30:00Z', description: 'Spinning up 20 GPU instances', severity: 'High' }
    ]
  },
  {
    id: 'chain-5',
    name: 'Web Application Attack',
    source_ip: '45.33.99.1',
    target_system: 'Public_Website',
    username: 'anonymous',
    start_time: '2024-05-20T20:00:00Z',
    end_time: '2024-05-20T20:15:00Z',
    severity: 'High',
    risk_score: 88,
    stages: [
      { stage: 1, type: 'Directory Traversal', timestamp: '2024-05-20T20:00:00Z', description: 'Attempting to access /etc/passwd', severity: 'Medium' },
      { stage: 2, type: 'SQL Injection', timestamp: '2024-05-20T20:05:00Z', description: 'UNION SELECT queries detected in logs', severity: 'High' },
      { stage: 3, type: 'Shell Upload', timestamp: '2024-05-20T20:10:00Z', description: 'Uploading .php file to images directory', severity: 'Critical' },
      { stage: 4, type: 'Command Execution', timestamp: '2024-05-20T20:15:00Z', description: 'whoami command run by web user', severity: 'Critical' }
    ]
  }
];

export const mockMLPerformance = {
  models: [
    { name: 'Random Forest', accuracy: 0.943, precision: 0.921, recall: 0.967, f1: 0.944, color: '#FFB800' },
    { name: 'Decision Tree', accuracy: 0.882, precision: 0.854, recall: 0.901, f1: 0.877, color: '#00FF9D' },
    { name: 'Logistic Regression', accuracy: 0.824, precision: 0.798, recall: 0.841, f1: 0.819, color: '#FF7700' }
  ],
  confusionMatrix: {
    labels: ['Normal', 'Brute Force', 'Port Scan', 'Malware', 'Data Exfil', 'Suspicious Login', 'Priv Escalation'],
    matrix: [
      [450, 3, 2, 1, 0, 5, 1],
      [5, 89, 1, 0, 0, 3, 0],
      [2, 0, 76, 1, 0, 0, 1],
      [1, 0, 2, 62, 1, 0, 0],
      [0, 0, 0, 1, 45, 0, 1],
      [4, 2, 0, 0, 0, 71, 2],
      [1, 0, 1, 0, 1, 1, 38]
    ]
  },
  featureImportance: [
    { feature: 'failed_attempts', importance: 0.23 },
    { feature: 'bytes_transferred', importance: 0.18 },
    { feature: 'destination_port', importance: 0.14 },
    { feature: 'login_hour', importance: 0.11 },
    { feature: 'source_ip_frequency', importance: 0.09 },
    { feature: 'protocol_encoded', importance: 0.08 },
    { feature: 'country_risk', importance: 0.07 },
    { feature: 'device_type_encoded', importance: 0.05 },
    { feature: 'event_type_encoded', importance: 0.03 },
    { feature: 'session_duration', importance: 0.02 }
  ]
};

const generateViolations = (count) => {
  const vTypes = ['after_hours_access', 'unauthorized_access', 'policy_violation', 'unencrypted_transfer', 'failed_auth_threshold'];
  const res = [];
  for(let i=0; i<count; i++) {
    res.push({
      id: `violation-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      type: vTypes[Math.floor(Math.random()*vTypes.length)],
      username: users[Math.floor(Math.random()*users.length)],
      source_ip: generateRandomIP(),
      description: 'Compliance rule broken due to specific action.',
      policy: `ISO_27001_CTRL_${Math.floor(Math.random()*100)}`,
      severity: ['Low','Medium','High','Critical'][Math.floor(Math.random()*4)],
      status: ['open', 'investigating', 'resolved'][Math.floor(Math.random()*3)]
    });
  }
  return res;
};
export const mockComplianceViolations = generateViolations(30);

const generateRecommendations = (count) => {
  const res = [];
  for(let i=0; i<count; i++) {
    res.push({
      id: `rec-${i}`,
      event_id: `evt-${10000 + i}`,
      timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      source_ip: generateRandomIP(),
      username: users[Math.floor(Math.random()*users.length)],
      attack_type: labels[Math.floor(Math.random()*(labels.length-1))+1],
      severity: ['Medium','High','Critical'][Math.floor(Math.random()*3)],
      risk_score: Math.floor(Math.random()*50)+50,
      reason: 'Anomaly detected in user behavior patterns.',
      recommendation: 'Block source IP and require user password reset.',
      escalation_level: ['Monitor','Investigate','Escalate','Isolate'][Math.floor(Math.random()*4)],
      status: ['pending','in_progress','completed','dismissed'][Math.floor(Math.random()*4)]
    });
  }
  return res;
};
export const mockRecommendations = generateRecommendations(20);

export const getEventStats = () => {
  return {
    total: mockEvents.length,
    critical: mockEvents.filter(e => e.severity === 'Critical').length,
    high: mockEvents.filter(e => e.severity === 'High').length,
    medium: mockEvents.filter(e => e.severity === 'Medium').length,
    low: mockEvents.filter(e => e.severity === 'Low').length
  };
};

export const getThreatsByType = () => {
  const counts = {};
  mockEvents.forEach(e => {
    if(e.label !== 'Normal') counts[e.label] = (counts[e.label] || 0) + 1;
  });
  return Object.keys(counts).map(k => ({ name: k, count: counts[k] }));
};

export const getThreatsBySeverity = () => {
  const stats = getEventStats();
  return [
    { name: 'Critical', count: stats.critical, color: '#ef4444' },
    { name: 'High', count: stats.high, color: '#f97316' },
    { name: 'Medium', count: stats.medium, color: '#f59e0b' },
    { name: 'Low', count: stats.low, color: '#10b981' }
  ];
};

export const getTopAttackingIPs = () => {
  const counts = {};
  mockEvents.filter(e => e.label !== 'Normal').forEach(e => {
    counts[e.source_ip] = (counts[e.source_ip] || 0) + 1;
  });
  return Object.keys(counts).map(k => ({ ip: k, count: counts[k] })).sort((a,b) => b.count - a.count).slice(0, 10);
};

export const getTimelineData = () => {
  // Return grouped events by date for line chart
  const timeline = [];
  // Mocking 7 days of data
  for(let i=6; i>=0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    timeline.push({
      date: d.toLocaleDateString(),
      Normal: Math.floor(Math.random()*100)+50,
      Malicious: Math.floor(Math.random()*20)+5
    });
  }
  return timeline;
};

export const getPortTargets = () => {
  const counts = {};
  mockEvents.filter(e => e.label !== 'Normal').forEach(e => {
    counts[e.destination_port] = (counts[e.destination_port] || 0) + 1;
  });
  return Object.keys(counts).map(k => ({ port: k, count: counts[k] })).sort((a,b) => b.count - a.count).slice(0, 5);
};

export const getComplianceSummary = () => {
  return {
    total: mockComplianceViolations.length,
    open: mockComplianceViolations.filter(v => v.status === 'open').length,
    resolved: mockComplianceViolations.filter(v => v.status === 'resolved').length
  };
};
