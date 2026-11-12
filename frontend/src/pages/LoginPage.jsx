import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';
import { ShieldCheck, AlertCircle, Lock, CheckCircle2, UserCheck } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [welcomeUser, setWelcomeUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectMessage = location.state?.message;
  const targetModule = location.state?.from;

  const handleFirebaseGoogleLogin = async () => {
    setLoading(true);
    const userData = await signInWithGoogle();
    setLoading(false);

    if (userData) {
      // Save user session
      onLogin(userData);
      localStorage.setItem('netsentinel_user', JSON.stringify(userData));

      // Show Greeting Popup Window
      setWelcomeUser(userData);

      // Automatically route to dashboard after 2 seconds
      setTimeout(() => {
        if (targetModule) {
          navigate('/dashboard', { state: { defaultModule: targetModule } });
        } else {
          navigate('/dashboard');
        }
      }, 2000);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '80px auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
      
      {/* GREETING POPUP WINDOW */}
      {welcomeUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(5, 8, 14, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="cyber-card partition-card" style={{
            maxWidth: '380px',
            width: '90%',
            textAlign: 'center',
            padding: '36px 24px',
            border: '1px solid var(--accent-green)',
            boxShadow: '0 0 30px rgba(0, 255, 102, 0.3)'
          }}>
            {welcomeUser.picture ? (
              <img 
                src={welcomeUser.picture} 
                alt="Google Avatar" 
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--accent-green)', marginBottom: '16px' }}
              />
            ) : (
              <UserCheck size={48} color="var(--accent-green)" style={{ marginBottom: '16px' }} />
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '8px' }}>
              <CheckCircle2 size={16} /> FIREBASE AUTH SUCCESSFUL
            </div>

            <h2 className="hacker-glow" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '22px', marginBottom: '8px' }}>
              WELCOME, {welcomeUser.name.toUpperCase()}!
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
              Loading NetSentinel SOC console for [{welcomeUser.email}]...
            </p>
          </div>
        </div>
      )}

      {/* LOGIN CARD */}
      <div className="cyber-card" style={{ padding: '40px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '12px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(0, 243, 255, 0.08)', 
            border: '1px solid rgba(0, 243, 255, 0.2)',
            marginBottom: '12px'
          }}>
            <Lock size={28} color="var(--accent-cyan)" />
          </div>
          <h2 className="hacker-glow" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '20px', marginBottom: '8px' }}>
            ANALYST AUTHENTICATION
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5' }}>
            Authenticate via Firebase Google sign-in to access tool modules.
          </p>
        </div>

        {redirectMessage && (
          <div className="alert-banner" style={{ marginBottom: '24px', fontSize: '12px' }}>
            <AlertCircle size={18} />
            <span>{redirectMessage}</span>
          </div>
        )}

        {/* CUSTOM CYBER GOOGLE BUTTON */}
        <button 
          onClick={handleFirebaseGoogleLogin}
          className="cyber-button"
          style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7 8.9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2-6.7-4.9L1.6 16C3.5 19.8 7.4 23 12 23z"/>
          </svg>
          {loading ? "CONNECTING..." : "CONTINUE WITH GOOGLE"}
        </button>

        <div style={{ textAlign: 'center', marginTop: '28px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          FIREBASE SECURE AUTH // SOC v2.4.0
        </div>
      </div>
    </div>
  );
}