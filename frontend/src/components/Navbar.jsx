import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Translucent, blurred, sticky top bar in the Apple style.
export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  return (
    <nav style={nav}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 19 }}>
          <span style={{ fontSize: 22 }}>🖍️</span>
          <span className="marker" style={{ fontSize: 24 }}>Inkboard</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button className="btn btn-ghost" style={{ padding: 6 }} onClick={toggle} title="Toggle theme">{theme === 'light' ? '🌙' : '☀️'}</button>
          {user ? (
            <>
              <Link to="/app" className="btn btn-ghost" style={{ padding: 6 }}>My boards</Link>
              <button className="btn btn-primary" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ padding: 6 }}>Sign in</Link>
              <Link to="/register" className="btn btn-primary">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const nav = {
  position: 'sticky', top: 0, zIndex: 50,
  background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
  backdropFilter: 'saturate(180%) blur(20px)',
  borderBottom: '1px solid var(--hairline)',
};
