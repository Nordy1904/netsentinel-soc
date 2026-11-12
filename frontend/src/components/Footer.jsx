import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '24px',
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-glow)',
      fontFamily: 'var(--font-mono)',
      fontSize: '12px',
      color: 'var(--text-muted)',
      marginTop: '60px'
    }}>
      <p>NET_SENTINEL // SEC-OPS DEFENSE ENGINE. ALL RIGHTS RESERVED.</p>
    </footer>
  );
}