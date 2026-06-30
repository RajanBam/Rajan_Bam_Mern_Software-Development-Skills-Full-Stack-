import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="paper" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div>
        <div className="marker" style={{ fontSize: 90, color: 'var(--crayon-blue)' }}>404</div>
        <p className="hand" style={{ fontSize: 28, color: 'var(--ink-soft)' }}>we scribbled outside the lines…</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 18 }}>Back to Inkboard</Link>
      </div>
    </div>
  );
}
