import { Link } from 'react-router-dom';

// Shared shell for the sign-in / sign-up screens.
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="paper" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 22 }}>
          <span style={{ fontSize: 26 }}>🖍️</span>
          <span className="marker" style={{ fontSize: 30 }}>Inkboard</span>
        </Link>
        <div style={card}>
          <h1 style={{ fontSize: 26, textAlign: 'center' }}>{title}</h1>
          <p style={{ textAlign: 'center', color: 'var(--ink-soft)', marginTop: 8, marginBottom: 22 }}>{subtitle}</p>
          {children}
        </div>
        <div style={{ textAlign: 'center', marginTop: 18, color: 'var(--ink-soft)' }}>{footer}</div>
      </div>
    </div>
  );
}

const card = { background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 22, padding: 30, boxShadow: 'var(--shadow-card)' };

export const field = {
  width: '100%', padding: '13px 15px', borderRadius: 12, border: '1px solid var(--hairline)',
  background: 'var(--bg)', color: 'var(--ink)', fontSize: 15, marginBottom: 12, outline: 'none',
};
