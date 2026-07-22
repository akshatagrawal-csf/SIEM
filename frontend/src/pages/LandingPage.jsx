import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Terminal, Activity, ArrowRight, ShieldCheck, 
  Radio, Lock, Database, Cpu, Globe, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';
import { AntigravityCanvas } from '../components/canvas/AntigravityCanvas';

export default function LandingPage() {
  const [liveLogs, setLiveLogs] = useState([
    { id: 1, time: '22:34:12', ip: '45.33.32.156', event: 'BRUTE_FORCE_SSH', severity: 'CRITICAL', status: 'ISOLATED' },
    { id: 2, time: '22:34:10', ip: '192.168.1.50', event: 'PRIVILEGE_ELEVATION', severity: 'HIGH', status: 'ANALYZING' },
    { id: 3, time: '22:34:05', ip: '10.0.4.12', event: 'UNENCRYPTED_FTP_TRANSFER', severity: 'MEDIUM', status: 'AUDITED' },
    { id: 4, time: '22:33:58', ip: '139.59.1.145', event: 'PORT_SCAN_RECON', severity: 'MEDIUM', status: 'BLOCKED' },
  ]);

  // Simulate incoming live telemetry stream on the hero widget
  useEffect(() => {
    const interval = setInterval(() => {
      const sampleIPs = ['185.220.101.5', '45.154.255.88', '192.168.2.14', '172.16.0.44'];
      const sampleEvents = ['EXFILTRATION_BURST', 'C2_BEACON_ATTEMPT', 'AUTH_FAIL_THRESHOLD', 'MALWARE_DROpper'];
      const sampleSeverities = ['CRITICAL', 'HIGH', 'CRITICAL', 'HIGH'];

      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        ip: sampleIPs[Math.floor(Math.random() * sampleIPs.length)],
        event: sampleEvents[Math.floor(Math.random() * sampleEvents.length)],
        severity: sampleSeverities[Math.floor(Math.random() * sampleSeverities.length)],
        status: 'DETECTED',
      };

      setLiveLogs(prev => [newLog, ...prev.slice(0, 4)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-siem-bg text-white font-sans relative overflow-x-hidden">
      {/* 2. Antigravity Floating Data Packet Physics Canvas */}
      <AntigravityCanvas />

      {/* 3. Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 px-6 lg:px-12 flex items-center justify-between border-b border-siem-border/80 bg-siem-bg/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-siem-orange flex items-center justify-center font-mono font-black text-black text-lg">
            S
          </div>
          <div>
            <span className="font-mono font-bold text-base tracking-wider text-white">SIEM<span className="text-siem-orange">.SOC</span></span>
            <span className="block text-[10px] font-mono text-siem-muted tracking-widest uppercase">Operational Authority</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 font-mono text-xs text-siem-secondaryText">
          <a href="#features" className="hover:text-siem-orange transition-colors">CAPABILITIES</a>
          <a href="#preview" className="hover:text-siem-orange transition-colors">SOC WIDGETS</a>
          <a href="#architecture" className="hover:text-siem-orange transition-colors">AI ENGINE</a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded font-mono text-xs font-semibold bg-siem-card text-white border border-siem-border hover:border-siem-orange/50 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-siem-orange" />
            <span>OPEN CONSOLE</span>
          </Link>
          <a
            href="#demo"
            className="px-5 py-2.5 rounded font-mono text-xs font-black bg-siem-orange text-black hover:bg-orange-500 transition-colors shadow-orange tracking-wider uppercase"
          >
            REQUEST DEMO
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="relative z-10 pt-28 pb-20 px-6 lg:px-12 max-w-7xl mx-auto space-y-24">
        
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-siem-orange/10 border border-siem-orange/30 font-mono text-xs font-semibold text-siem-orange">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>NEXT-GEN ENTERPRISE SIEM PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none">
              Command Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-siem-orange via-siem-yellow to-white">
                Security Posture.
              </span>
            </h1>

            <p className="text-siem-secondaryText text-base leading-relaxed max-w-2xl">
              High-throughput log ingestion, real-time Random Forest threat classification, and multi-stage attack correlation. Built specifically for high-stakes Security Operations Centers.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
              <Link
                to="/"
                className="px-6 py-3.5 rounded font-bold bg-siem-orange text-black hover:bg-orange-500 transition-colors flex items-center gap-2 uppercase tracking-wider shadow-orange"
              >
                <span>Launch SOC Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="px-6 py-3.5 rounded font-semibold bg-siem-card text-white border border-siem-border hover:border-siem-orange/40 transition-colors flex items-center gap-2"
              >
                <span>View Architecture</span>
              </a>
            </div>

            {/* Platform Metrics Pills */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-siem-border/80 font-mono">
              <div>
                <span className="block text-2xl font-bold text-white">100K+</span>
                <span className="text-[11px] text-siem-muted uppercase">Events / Sec</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-siem-yellow">0.995</span>
                <span className="text-[11px] text-siem-muted uppercase">AI Precision</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-siem-emerald">&lt;50ms</span>
                <span className="text-[11px] text-siem-muted uppercase">Alert Latency</span>
              </div>
            </div>
          </div>

          {/* Hero Live Threat Feed Glassmorphism Card */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-5 bg-siem-card/90 border border-siem-border rounded-xl shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-siem-border font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-siem-orange animate-pulse" />
                  <span className="font-bold text-white tracking-wider">LIVE THREAT TELEMETRY</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-siem-crimson/20 text-siem-crimson border border-siem-crimson/30 text-[10px] font-bold">
                  ACTIVE FEED
                </span>
              </div>

              {/* Stream List */}
              <div className="space-y-2.5 font-mono text-xs">
                {liveLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded bg-siem-bgSecondary border border-siem-border/80 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-siem-muted text-[10px]">{log.time}</span>
                        <span className="text-siem-orange font-semibold truncate">{log.ip}</span>
                      </div>
                      <p className="text-white font-bold text-[11px] truncate">{log.event}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'CRITICAL' 
                          ? 'bg-siem-crimson/20 text-siem-crimson border border-siem-crimson/40' 
                          : 'bg-siem-amber/20 text-siem-amber border border-siem-amber/40'
                      }`}>
                        {log.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-siem-border flex justify-between items-center font-mono text-[11px] text-siem-muted">
                <span>Ingestion Engine: Online</span>
                <span className="text-siem-emerald flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Operational
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* DASHBOARD PREVIEW WIDGET GRID */}
        <section id="preview" className="space-y-8 pt-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
              Real-Time SOC Command Widgets
            </h2>
            <p className="text-siem-secondaryText text-sm font-mono">
              Designed for rapid triage, risk scoring, and immediate incident containment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Widget 1: Log Ingestion Velocity */}
            <div className="glass-panel p-6 bg-siem-card border border-siem-border rounded-xl space-y-4">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-siem-muted font-bold uppercase">Log Ingestion Velocity</span>
                <Database className="w-4 h-4 text-siem-orange" />
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-mono font-bold text-white">48,290</span>
                <p className="text-xs text-siem-muted font-mono">Events processed per second</p>
              </div>
              {/* Progress Bars */}
              <div className="space-y-2 pt-2 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-siem-secondaryText">Syslog Egress</span>
                    <span className="text-siem-orange font-bold">92%</span>
                  </div>
                  <div className="w-full h-1.5 rounded bg-siem-bg overflow-hidden">
                    <div className="h-full bg-siem-orange rounded" style={{ width: '92%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-siem-secondaryText">WinEvent API</span>
                    <span className="text-siem-yellow font-bold">78%</span>
                  </div>
                  <div className="w-full h-1.5 rounded bg-siem-bg overflow-hidden">
                    <div className="h-full bg-siem-yellow rounded" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: Threat Map Vector */}
            <div className="glass-panel p-6 bg-siem-card border border-siem-border rounded-xl space-y-4">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-siem-muted font-bold uppercase">Threat Vector Matrix</span>
                <Globe className="w-4 h-4 text-siem-yellow" />
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-mono font-bold text-siem-yellow">139.59.1.145</span>
                <p className="text-xs text-siem-muted font-mono">Top malicious origin IP</p>
              </div>
              <div className="p-3 rounded bg-siem-bgSecondary border border-siem-border font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-siem-muted">Vector Type:</span>
                  <span className="text-white font-bold">Brute Force SSH</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-siem-muted">Risk Score:</span>
                  <span className="text-siem-crimson font-bold">94.8 / 100</span>
                </div>
              </div>
            </div>

            {/* Widget 3: Agent Status */}
            <div className="glass-panel p-6 bg-siem-card border border-siem-border rounded-xl space-y-4">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-siem-muted font-bold uppercase">Sensor Agent Fleet</span>
                <Cpu className="w-4 h-4 text-siem-emerald" />
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-mono font-bold text-siem-emerald">1,420 / 1,424</span>
                <p className="text-xs text-siem-muted font-mono">Active endpoints transmitting</p>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
                <div className="p-2.5 rounded bg-siem-bgSecondary border border-siem-border">
                  <span className="text-[10px] text-siem-muted block">FIREWALLS</span>
                  <span className="font-bold text-white">48 Active</span>
                </div>
                <div className="p-2.5 rounded bg-siem-bgSecondary border border-siem-border">
                  <span className="text-[10px] text-siem-muted block">SERVERS</span>
                  <span className="font-bold text-white">1,372 Active</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES / ARCHITECTURE */}
        <section id="features" className="space-y-8 pt-10 border-t border-siem-border">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
              Operational Authority Architecture
            </h2>
            <p className="text-siem-secondaryText text-sm font-mono">
              Industrial security tools built to eliminate SOC fatigue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Random Forest AI",
                desc: "Trained on 10,000+ security events. Evaluates 8-dimensional feature vectors to detect zero-day attacks.",
                icon: ShieldAlert,
                accent: "border-siem-orange/40 text-siem-orange"
              },
              {
                title: "Attack Chains",
                desc: "Correlates isolated alerts into multi-stage attack storylines (Port Scan → Exfiltration).",
                icon: Terminal,
                accent: "border-siem-yellow/40 text-siem-yellow"
              },
              {
                title: "0–100 Risk Score",
                desc: "Dynamic mathematical algorithm scoring incidents based on AI confidence, rule weight, and exfiltration volume.",
                icon: Activity,
                accent: "border-siem-crimson/40 text-siem-crimson"
              },
              {
                title: "Compliance Audit",
                desc: "Automated enforcement checks for ISO-27001, SOC2, and PCI-DSS control standards.",
                icon: ShieldCheck,
                accent: "border-siem-emerald/40 text-siem-emerald"
              }
            ].map((feat, i) => (
              <div key={i} className={`glass-panel p-6 bg-siem-card border ${feat.accent} rounded-xl space-y-3`}>
                <feat.icon className={`w-6 h-6 ${feat.accent.split(' ')[1]}`} />
                <h3 className="font-mono font-bold text-base text-white">{feat.title}</h3>
                <p className="text-xs text-siem-secondaryText leading-relaxed font-mono">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section id="demo" className="glass-panel p-8 md:p-12 bg-siem-card border border-siem-orange/40 rounded-2xl text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">
            Ready To Command Your SOC?
          </h2>
          <p className="text-siem-secondaryText text-sm font-mono max-w-xl mx-auto">
            Experience real-time AI threat detection, attack correlation, and compliance auditing in action.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs">
            <Link
              to="/"
              className="px-8 py-3.5 rounded font-black bg-siem-orange text-black hover:bg-orange-500 transition-colors uppercase tracking-wider shadow-orange"
            >
              LAUNCH FULL SOC CONSOLE
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-12 border-t border-siem-border/80 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-siem-muted">
          <div>
            <span className="text-white font-bold">SIEM.SOC Platform</span> • Operational Authority Design System
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-siem-orange transition-colors">CAPABILITIES</a>
            <a href="#preview" className="hover:text-siem-orange transition-colors">WIDGETS</a>
            <Link to="/" className="hover:text-siem-orange transition-colors">CONSOLE</Link>
          </div>
          <div>
            © 2026 SIEM Analytics. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
