import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, User, LogOut, Terminal, History, Menu, X } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <nav className="soc-navbar">
      {/* Top Row: Logo & Mobile Hamburger Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Link 
          to="/" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
        >
          <Shield size={22} color="var(--accent-cyan)" />
          <span className="hacker-glow" style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
            NET_SENTINEL // SOC
          </span>
        </Link>

        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation Links: Context-Aware (Dashboard Console vs Landing Page) */}
      <div className={`nav-links-container ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        
        {isDashboard ? (
          /* CONSOLE VIEW HEADER OPTIONS */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-green)', padding: '6px 10px' }}>
              <span>OPERATOR: [{user?.name || 'ANALYST'}]</span>
            </div>

            <Link to="/dashboard" className="cyber-nav-btn" onClick={() => setMobileMenuOpen(false)} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: 'rgba(0, 243, 255, 0.1)' }}>
              <Terminal size={13} /> SOC CONSOLE
            </Link>
          </>
        ) : (
          /* LANDING PAGE VIEW HEADER OPTIONS */
          <>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/dashboard', { state: { defaultModule: 'host_info' } }); }} className="cyber-nav-btn" style={{ padding: '6px 12px', fontSize: '11px' }}>
              <Terminal size={13} /> LAUNCH CONSOLE
            </button>
          </>
        )}

        {/* Auth State Button */}
        {user ? (
          <button className="cyber-nav-btn" onClick={() => { setMobileMenuOpen(false); onLogout(); navigate('/'); }} style={{ padding: '6px 10px', fontSize: '11px', borderColor: 'var(--alert-red)', color: 'var(--alert-red)' }}>
            <LogOut size={13} /> LOGOUT
          </button>
        ) : (
          <Link to="/login" className="cyber-nav-btn" onClick={() => setMobileMenuOpen(false)} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: 'rgba(0, 243, 255, 0.15)' }}>
            <User size={13} /> LOGIN
          </Link>
        )}

      </div>
    </nav>
  );
}