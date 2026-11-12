import React, { useState, useEffect } from 'react';
import { History, Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem('netsentinel_logs') || '[]');
    setLogs(savedLogs);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('netsentinel_logs');
    setLogs([]);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <div className="cyber-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={22} /> STORED SCAN HISTORY & AUDIT LOGS
          </h2>
          {logs.length > 0 && (
            <button className="cyber-button" onClick={clearHistory} style={{ borderColor: 'var(--alert-red)', color: 'var(--alert-red)' }}>
              <Trash2 size={14} /> CLEAR LOGS
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
            No scan logs recorded yet. Initialize a scan from the Scanner console.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map((log, index) => (
              <div key={index} style={{
                padding: '14px',
                border: '1px solid var(--border-glow)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px'
              }}>
                <div>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{log.target}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '10px' }}>[{log.type}]</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}