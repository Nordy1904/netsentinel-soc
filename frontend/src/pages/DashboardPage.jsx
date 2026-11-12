import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Globe, ShieldAlert, FileSearch, Lock, Server, 
  Terminal, Play, Download, CheckCircle, 
  AlertTriangle, Activity, Shield, Cpu, Check, X, Radio
} from 'lucide-react';

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialModule = location.state?.defaultModule && location.state.defaultModule !== 'all' 
    ? location.state.defaultModule 
    : 'host_info';

  const [user, setUser] = useState(null);
  const [activeModule, setActiveModule] = useState(initialModule);
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const abortControllerRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('netsentinel_user');
    if (!storedUser) {
      navigate('/login', { 
        state: { message: 'Access Denied: Analyst authentication required.' } 
      });
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const modules = [
    { id: 'host_info', label: 'HOST & IP INTEL', endpoint: 'host', icon: Globe, color: 'var(--accent-cyan)', placeholder: 'e.g., 8.8.8.8' },
    { id: 'port_threat', label: 'PORT & CVE SCAN', endpoint: 'ports', icon: ShieldAlert, color: 'var(--alert-red)', placeholder: 'e.g., 45.33.32.156' },
    { id: 'subdomain_dns', label: 'SUBDOMAINS & DNS', endpoint: 'subdomains', icon: FileSearch, color: 'var(--warning-amber)', placeholder: 'e.g., example.com' },
    { id: 'dir_exposure', label: 'DIR EXPOSURE', endpoint: 'directory', icon: Lock, color: 'var(--accent-green)', placeholder: 'e.g., example.com' },
    { id: 'ssl_audit', label: 'SSL & HEADERS', endpoint: 'ssl', icon: Server, color: 'var(--accent-cyan)', placeholder: 'e.g., google.com' }
  ];

  const currentModuleObj = modules.find(m => m.id === activeModule) || modules[0];

  const handleTabSwitch = (modId) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsScanning(false);
    setScanProgress(0);
    setActiveModule(modId);
    setScanResult(null);
    setTerminalLogs([]);
    setErrorMsg('');
    setTarget('');
  };

  const handleExecuteScan = async (e) => {
    e.preventDefault();
    if (!target.trim()) {
      setErrorMsg('Target parameter missing. Please enter a valid domain or IPv4.');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setErrorMsg('');
    setIsScanning(true);
    setScanResult(null);
    setScanProgress(25);

    const addLog = (msg) => {
      const time = new Date().toLocaleTimeString();
      setTerminalLogs(prev => [...prev, `[${time}] ${msg}`]);
    };

    setTerminalLogs([`[INIT] Querying backend for ${currentModuleObj.label}...`]);

    try {
      setScanProgress(60);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/scan/${currentModuleObj.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim() }),
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      setScanProgress(90);
      const finalReport = {
        id: `SCAN-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        analyst: user?.name || 'SecOps Analyst',
        module: currentModuleObj.label,
        target: target.trim(),
        findings: data
      };

      const existingLogs = JSON.parse(localStorage.getItem('netsentinel_logs') || '[]');
      localStorage.setItem('netsentinel_logs', JSON.stringify([finalReport, ...existingLogs]));

      setScanProgress(100);
      addLog(`[SUCCESS] Probe completed successfully. Report ID: ${finalReport.id}`);
      setScanResult(finalReport);
      setIsScanning(false);

    } catch (err) {
      if (err.name === 'AbortError') return;
      setErrorMsg(err.message || 'Failed to connect to backend server.');
      addLog(`[ERROR] Scan execution failed.`);
      setIsScanning(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!scanResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scanResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${scanResult.id}_${scanResult.target}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // RENDER DYNAMIC BADGED FINDINGS
  const renderFindingsContent = (findings) => {
    if (!findings) return null;

    // 1. SUBDOMAINS RENDERER
    if (activeModule === 'subdomain_dns') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            ROOT DOMAIN: <strong style={{ color: 'var(--accent-cyan)' }}>{findings.rootDomain}</strong> | TOTAL ACTIVE: <strong style={{ color: 'var(--accent-green)' }}>{findings.totalDiscovered}</strong>
          </div>
          {findings.subdomains?.map((sub, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0, 243, 255, 0.04)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(0, 243, 255, 0.15)' }}>
              <span style={{ color: '#fff', fontSize: '12px' }}>{sub}</span>
              <span style={{ backgroundColor: 'rgba(0, 255, 128, 0.15)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Radio size={10} /> ACTIVE
              </span>
            </div>
          ))}
        </div>
      );
    }

    // 2. DIRECTORY EXPOSURE RENDERER
    if (activeModule === 'dir_exposure') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            TARGET ROOT: <strong style={{ color: 'var(--accent-cyan)' }}>{findings.targetRoot}</strong>
          </div>
          {findings.probedPaths?.map((item, idx) => {
            const isWarning = item.severity === 'WARNING';
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(5, 8, 12, 0.9)', padding: '8px 12px', borderRadius: '4px', border: `1px solid ${isWarning ? 'var(--warning-amber)' : 'rgba(255,255,255,0.1)'}` }}>
                <span style={{ color: '#fff', fontSize: '12px' }}>{item.path}</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{item.status}</span>
                  <span style={{ 
                    backgroundColor: isWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 255, 128, 0.15)', 
                    color: isWarning ? 'var(--warning-amber)' : 'var(--accent-green)', 
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' 
                  }}>
                    {isWarning ? 'EXPOSED' : 'SECURE'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // 3. PORT & CVE SCAN RENDERER
    if (activeModule === 'port_threat') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            RESOLVED IP: <strong style={{ color: 'var(--accent-cyan)' }}>{findings.resolvedIP}</strong>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>OPEN PORTS DETECTED:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {findings.ports?.map((port, idx) => (
                <span key={idx} style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--alert-red)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  PORT {port} [OPEN]
                </span>
              ))}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>CVE VULNERABILITIES:</span>
            {findings.cves?.map((cve, idx) => (
              <div key={idx} style={{ backgroundColor: 'rgba(5, 8, 12, 0.8)', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', color: 'var(--warning-amber)', marginBottom: '4px' }}>
                ⚠️ {cve}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // DEFAULT JSON FALLBACK FOR OTHER MODULES
    return (
      <pre style={{ margin: 0, color: 'var(--text-main)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>
        {JSON.stringify(findings, null, 2)}
      </pre>
    );
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px 80px 20px', position: 'relative', zIndex: 1 }}>
      
      {/* STATUS BAR */}
      <div className="cyber-card" style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
        padding: '16px 24px', marginBottom: '24px', borderLeft: '4px solid var(--accent-cyan)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={24} color="var(--accent-cyan)" />
          <div>
            <h1 className="hacker-glow" style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--accent-cyan)', margin: 0 }}>
              NETSENTINEL // SOC CONSOLE
            </h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
              OPERATOR: <strong style={{ color: 'var(--accent-green)' }}>{user.name.toUpperCase()}</strong>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-green)' }}>
          <Activity size={16} /> <span>SYSTEM OPERATIONAL</span>
        </div>
      </div>

      {/* MODULE TABS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {modules.map((mod) => {
          const IconComponent = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => handleTabSwitch(mod.id)}
              className="cyber-card"
              style={{
                padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                border: isActive ? `1px solid ${mod.color}` : '1px solid var(--border-glow)',
                backgroundColor: isActive ? 'rgba(0, 243, 255, 0.12)' : 'rgba(13, 17, 23, 0.75)',
                boxShadow: isActive ? `0 0 15px rgba(0, 243, 255, 0.2)` : 'none',
                textAlign: 'left'
              }}
            >
              <IconComponent size={20} color={mod.color} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold', color: isActive ? '#ffffff' : 'var(--text-muted)' }}>
                {mod.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* TARGET INPUT */}
      <div className="cyber-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Cpu size={20} color={currentModuleObj.color} />
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--text-main)', margin: 0 }}>
            MODULE: <span style={{ color: currentModuleObj.color }}>{currentModuleObj.label}</span>
          </h2>
        </div>

        <form onSubmit={handleExecuteScan} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <input
              type="text"
              className="cyber-input"
              placeholder={currentModuleObj.placeholder}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={isScanning}
            />
          </div>
          <button type="submit" className="cyber-button" disabled={isScanning} style={{ padding: '10px 24px', minWidth: '160px' }}>
            {isScanning ? 'PROBING...' : <><Play size={16} /> RUN SCAN</>}
          </button>
        </form>

        {errorMsg && (
          <div className="alert-banner" style={{ marginTop: '16px', fontSize: '12px' }}>
            <AlertTriangle size={16} /> <span>{errorMsg}</span>
          </div>
        )}

        {isScanning && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-cyan)', marginBottom: '6px' }}>
              <span>EXECUTING THREAT PROBE...</span>
              <span>{scanProgress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${scanProgress}%`, height: '100%', backgroundColor: 'var(--accent-cyan)', boxShadow: '0 0 10px var(--accent-cyan)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* TERMINAL & RESULTS */}
      {(terminalLogs.length > 0 || scanResult) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="cyber-card" style={{ padding: '20px', borderTop: '2px solid var(--accent-green)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-green)' }}>
              <Terminal size={16} /> <span>EXECUTION LOGS</span>
            </div>
            <div style={{ backgroundColor: 'rgba(5, 8, 12, 0.85)', padding: '14px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '12px', minHeight: '220px', maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {terminalLogs.map((log, i) => (
                <div key={i} style={{ color: log.includes('[SUCCESS]') ? 'var(--accent-green)' : 'var(--text-muted)', lineHeight: '1.5' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {scanResult && (
            <div className="cyber-card" style={{ padding: '20px', borderTop: '2px solid var(--accent-cyan)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-cyan)' }}>
                  <CheckCircle size={16} color="var(--accent-green)" /> <span>REPORT // {scanResult.id}</span>
                </div>
                <button onClick={handleDownloadJSON} className="cyber-button" style={{ padding: '6px 12px', fontSize: '11px' }}>
                  <Download size={13} /> EXPORT JSON
                </button>
              </div>
              <div style={{ backgroundColor: 'rgba(5, 8, 12, 0.85)', padding: '16px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '12px', overflowX: 'auto', maxHeight: '350px', overflowY: 'auto' }}>
                {renderFindingsContent(scanResult.findings)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}