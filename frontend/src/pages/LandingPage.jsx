import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, ShieldAlert, FileSearch, Lock, Cpu, Server, 
  Terminal, ShieldCheck, Github, Linkedin, Twitter, ExternalLink, ArrowRight, Activity, Radio 
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [matrixCols, setMatrixCols] = useState([]);
  const [liveStreamLogs, setLiveStreamLogs] = useState([
    "[SYS_INIT] Secure SOC pipeline connected...",
    "[RADAR] Scanning subnet 192.168.1.0/24...",
    "[HEARTBEAT] Shodan InternetDB node responding..."
  ]);

  // Generate advanced matrix code rain & telemetry simulation
  useEffect(() => {
    const cols = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${i * 3.3}%`,
      duration: `${Math.random() * 4 + 2.5}s`,
      delay: `${Math.random() * 3}s`,
      text: generateCyberStream()
    }));
    setMatrixCols(cols);

    // Live telemetry simulation tick
    const interval = setInterval(() => {
      const simulatedTargets = ["scanme.nmap.org", "10.0.4.15", "api.netsentinel.sec", "192.168.0.1", "target-cluster-04"];
      const simulatedActions = [
        "RESOLVED IPv4 HOST TELEMETRY",
        "QUERIED SHODAN CVE DATABASE",
        "INDEXED CERTIFICATE TRANSPARENCY LOGS",
        "INSPECTED EXPOSED .ENV ENDPOINTS",
        "VERIFIED SSL/TLS HSTS HEADERS"
      ];
      const randomTarget = simulatedTargets[Math.floor(Math.random() * simulatedTargets.length)];
      const randomAction = simulatedActions[Math.floor(Math.random() * simulatedActions.length)];
      const timestamp = new Date().toLocaleTimeString();

      setLiveStreamLogs(prev => [
        `[${timestamp}] ${randomAction} -> TARGET: ${randomTarget}`,
        ...prev.slice(0, 4)
      ]);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  function generateCyberStream() {
    const chars = "01NET_SENTINEL[SOC]#$_-SEC/TCP/IP~ACK";
    let str = "";
    for (let i = 0; i < 18; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length)) + " ";
    }
    return str;
  }

  const handleToolClick = (moduleName) => {
    const storedUser = localStorage.getItem('netsentinel_user');
    if (!storedUser) {
      navigate('/login', { state: { from: moduleName, message: 'Authentication Required: Please login before accessing NetSentinel threat tools.' } });
    } else {
      navigate('/dashboard', { state: { defaultModule: moduleName } });
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Hyper-Realistic Matrix Code Rain Simulation Background */}
      <div className="matrix-rain-container">
        {matrixCols.map(col => (
          <div 
            key={col.id} 
            className="matrix-column" 
            style={{ left: col.left, animationDuration: col.duration, animationDelay: col.delay }}
          >
            {col.text}
          </div>
        ))}
      </div>

      {/* Cyberpunk Rotating Radar Ring Watermark */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '5%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        border: '1px dashed rgba(0, 243, 255, 0.15)',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'spinRadar 25s linear infinite'
      }}>
        <div style={{
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          border: '1px solid rgba(0, 255, 102, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '1px dashed rgba(0, 243, 255, 0.2)' }}></div>
        </div>
      </div>

      {/* Animated Watermark Background */}
      <div className="watermark-bg">NET_SENTINEL</div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        
        {/* HERO SECTION */}
        <section id="hero-section" style={{ padding: '70px 0 40px 0', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 16px', 
            borderRadius: '20px', 
            backgroundColor: 'rgba(0, 243, 255, 0.05)', 
            border: '1px solid rgba(0, 243, 255, 0.2)',
            marginBottom: '20px'
          }}>
            <Radio size={14} color="var(--accent-green)" className="hacker-glow" />
            <span className="hacker-cursor" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-cyan)' }}>
              LIVE THREAT RECONNAISSANCE SIMULATION ACTIVE
            </span>
          </div>

          <h1 className="gradient-text hacker-glow" style={{ fontSize: 'clamp(28px, 5vw, 50px)', fontFamily: 'var(--font-mono)', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.2' }}>
            NETSENTINEL SOC INTELLIGENCE SUITE
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '800px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
            A modular threat intelligence platform engineered for real-time network probes, host telemetry resolution, active CVE vulnerability detection, and exposed asset audits.
          </p>

          {/* Live Telemetry Simulation Feed Ticker */}
          <div className="cyber-card" style={{ maxWidth: '750px', margin: '0 auto 30px auto', padding: '12px 20px', textAlign: 'left', borderLeft: '3px solid var(--accent-green)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-green)' }}>
              <Activity size={14} /> REAL-TIME PACKET INTERCEPTION TELEMETRY:
            </div>
            {liveStreamLogs.slice(0, 2).map((log, idx) => (
              <div key={idx} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', opacity: idx === 0 ? 1 : 0.6 }}>
                {log}
              </div>
            ))}
          </div>

          <button 
            onClick={() => handleToolClick('host_info')} 
            className="cyber-button partition-card" 
            style={{ fontSize: '14px', padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
          >
            <Terminal size={18} /> INITIALIZE LIVE SIMULATION <ArrowRight size={16} />
          </button>
        </section>

        {/* ABOUT PROJECT SECTION */}
        <section id="about-section" style={{ padding: '40px 0' }}>
          <div className="cyber-card partition-card" style={{ padding: '30px' }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
              <Cpu size={22} /> PROJECT ARCHITECTURE & DESIGN PURPOSE
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '14px', marginBottom: '20px' }}>
              NetSentinel SOC provides security analysts and administrators with direct visibility into external network footprints. Featuring live simulations and real-time backend API integration, operators can execute vulnerability assessments with instant telemetry feedback.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="partition-card" style={{ padding: '14px', backgroundColor: 'rgba(10, 13, 18, 0.6)', borderRadius: '4px' }}>
                <h4 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', marginBottom: '6px', fontSize: '13px' }}>⚡ Live API Pipeline</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Queries live authoritative endpoints including Shodan InternetDB and IP geolocations.</p>
              </div>

              <div className="partition-card" style={{ padding: '14px', backgroundColor: 'rgba(10, 13, 18, 0.6)', borderRadius: '4px' }}>
                <h4 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '6px', fontSize: '13px' }}>🛡️ Auth Gate Protection</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Requires authenticated analyst sessions before executing security probes.</p>
              </div>

              <div className="partition-card" style={{ padding: '14px', backgroundColor: 'rgba(10, 13, 18, 0.6)', borderRadius: '4px' }}>
                <h4 style={{ fontFamily: 'var(--font-mono)', color: 'var(--warning-amber)', marginBottom: '6px', fontSize: '13px' }}>📊 Audit Logging</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Persists scan results and enables instant JSON vulnerability report exports.</p>
              </div>
            </div>
          </div>
        </section>

        {/* HORIZONTAL SLIDING TOOL MODULES CARDS */}
        <section id="modules-section" style={{ padding: '40px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '24px', marginBottom: '8px' }}>
              RECONNAISSANCE TOOL MODULES
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Swipe or scroll horizontally to browse simulation tools. Click any card to launch.
            </p>
          </div>

          <div className="horizontal-slider">
            
            {/* Tool 1 */}
            <div id="tool-host" className="cyber-card partition-card sliding-tool-card" style={{ cursor: 'pointer', padding: '24px' }} onClick={() => handleToolClick('host_info')}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Globe size={28} color="var(--accent-cyan)" />
                  <h3 style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontSize: '16px' }}>
                    1. Domain Host & IP Geolocation Intel
                  </h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                  Resolves target domains to IPv4 addresses. Fetches ASN details, ISP providers, country/city geolocations, and network registry data.
                </p>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>RUN HOST PROBE</span> <ArrowRight size={14} />
              </div>
            </div>

            {/* Tool 2 */}
            <div id="tool-port" className="cyber-card partition-card sliding-tool-card" style={{ cursor: 'pointer', padding: '24px' }} onClick={() => handleToolClick('port_threat')}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <ShieldAlert size={28} color="var(--alert-red)" />
                  <h3 style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontSize: '16px' }}>
                    2. Port Scanner & CVE Threat Evaluator
                  </h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                  Queries Shodan InternetDB to uncover open network ports (HTTP, SSH, FTP, DB) and flags known Common Vulnerabilities (CVEs).
                </p>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--alert-red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>RUN PORT PROBE</span> <ArrowRight size={14} />
              </div>
            </div>

            {/* Tool 3 */}
            <div id="tool-subdomain" className="cyber-card partition-card sliding-tool-card" style={{ cursor: 'pointer', padding: '24px' }} onClick={() => handleToolClick('subdomain_dns')}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <FileSearch size={28} color="var(--warning-amber)" />
                  <h3 style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontSize: '16px' }}>
                    3. Subdomain Enumerator & DNS Mapping
                  </h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                  Performs passive subdomain discovery using Certificate Transparency (CT) logs via crt.sh to map active hostnames and DNS records.
                </p>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--warning-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>RUN ENUMERATOR</span> <ArrowRight size={14} />
              </div>
            </div>

            {/* Tool 4 */}
            <div id="tool-dir" className="cyber-card partition-card sliding-tool-card" style={{ cursor: 'pointer', padding: '24px' }} onClick={() => handleToolClick('dir_exposure')}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Lock size={28} color="var(--accent-green)" />
                  <h3 style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontSize: '16px' }}>
                    4. Directory Bruteforce & Confidential File Probe
                  </h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                  Inspects web roots for exposed sensitive files (`.env`, `.git`, `robots.txt`, `sitemap.xml`) and flags dangerous HTTP configuration leaks.
                </p>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>RUN DIRECTORY PROBE</span> <ArrowRight size={14} />
              </div>
            </div>

            {/* Tool 5 */}
            <div id="tool-ssl" className="cyber-card partition-card sliding-tool-card" style={{ cursor: 'pointer', padding: '24px' }} onClick={() => handleToolClick('ssl_audit')}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Server size={28} color="var(--accent-cyan)" />
                  <h3 style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontSize: '16px' }}>
                    5. SSL Certificate & Security Header Auditor
                  </h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                  Audits SSL/TLS encryption certificates for validity and verifies defensive HTTP headers like HSTS, CSP, and X-Frame-Options.
                </p>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>RUN HEADER AUDIT</span> <ArrowRight size={14} />
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer style={{
        marginTop: '60px',
        backgroundColor: 'rgba(10, 13, 18, 0.95)',
        borderTop: '1px solid var(--border-glow)',
        padding: '50px 20px 24px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px', marginBottom: '30px' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldCheck size={22} color="var(--accent-cyan)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--accent-cyan)', fontSize: '14px' }}>NETSENTINEL SOC</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.6' }}>
              Designed for security analysts and penetration testers to execute authorized threat reconnaissance operations.
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', marginBottom: '12px', fontSize: '13px' }}>
              DEVELOPER & CREATOR
            </h4>
            <p style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: 'bold' }}>Lead Developer: Jatin</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Cyber Security Operations & Full-Stack Engineering</p>
            <p style={{ color: 'var(--accent-cyan)', fontSize: '11px', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>Build: v2.4.0-SIMULATION</p>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', marginBottom: '12px', fontSize: '13px' }}>
              SOCIAL & CONTACT HANDLES
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Github size={15} color="var(--accent-cyan)" /> GitHub Repository <ExternalLink size={11} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Linkedin size={15} color="var(--accent-cyan)" /> LinkedIn Profile <ExternalLink size={11} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Twitter size={15} color="var(--accent-cyan)" /> Twitter / X Updates <ExternalLink size={11} />
              </a>
            </div>
          </div>

        </div>

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          paddingTop: '16px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}>
          <div>© {new Date().getFullYear()} NETSENTINEL SOC. ALL RIGHTS RESERVED.</div>
          <div>AUTHORIZED SECURITY RECONNAISSANCE ONLY.</div>
        </div>
      </footer>
    </div>
  );
}