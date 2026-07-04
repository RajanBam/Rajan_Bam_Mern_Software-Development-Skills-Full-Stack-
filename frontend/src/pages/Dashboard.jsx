import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { listBoards, createBoard, deleteBoard } from '../api/boards';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listBoards().then((b) => { setBoards(b); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function onNew() {
    const board = await createBoard('Untitled board');
    navigate(`/board/${board.id}`);
  }

  async function onDelete(e, id) {
    e.stopPropagation();
    if (!confirm('Delete this board? This cannot be undone.')) return;
    await deleteBoard(id);
    setBoards((bs) => bs.filter((b) => b.id !== id));
  }

  return (
    <div className="paper" style={{ minHeight: '100vh' }}>
      <div style={topbar}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <span className="marker" style={{ fontSize: 26 }}>🖍️ Inkboard</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ color: 'var(--ink-soft)' }}>Hi, {user?.name?.split(' ')[0]} 👋</span>
            <button className="btn btn-soft" style={{ padding: '6px 12px' }} onClick={toggle}>{theme === 'light' ? '🌙' : '☀️'}</button>
            <button className="btn btn-soft" onClick={logout}>Log out</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <h1 style={{ fontSize: 34 }}>Your boards</h1>
          <button className="btn btn-primary" onClick={onNew}>+ New board</button>
        </div>

        {loading ? (
          <p className="hand" style={{ fontSize: 22, color: 'var(--ink-soft)' }}>loading your doodles…</p>
        ) : boards.length === 0 ? (
          <EmptyState onNew={onNew} />
        ) : (
          <div style={grid}>
            {boards.map((b) => (
              <div key={b.id} style={cardStyle} onClick={() => navigate(`/board/${b.id}`)}>
                <div style={thumb}>
                  {b.thumbnail
                    ? <img src={b.thumbnail} alt="" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                    : <span className="hand" style={{ fontSize: 26, color: 'var(--ink-soft)' }}>empty board</span>}
                </div>
                <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="marker" style={{ fontSize: 19 }}>{b.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                      {b.elementCount} items · {new Date(b.updatedAt).toLocaleDateString()}
                      {b.isPublic && ' · public'}
                    </div>
                  </div>
                  <button className="btn" style={{ padding: 6, color: 'var(--ink-soft)' }} onClick={(e) => onDelete(e, b.id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onNew }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: 60 }}>🎨</div>
      <h2 className="marker" style={{ fontSize: 30, margin: '14px 0 6px' }}>No boards yet</h2>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 22 }}>Your first blank canvas is one click away.</p>
      <button className="btn btn-primary" onClick={onNew}>+ Create your first board</button>
    </div>
  );
}

const topbar = { background: 'color-mix(in srgb, var(--surface) 82%, transparent)', backdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid var(--hairline)', position: 'sticky', top: 0, zIndex: 10 };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 };
const cardStyle = { background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow-card)', transition: 'transform 0.15s ease' };
const thumb = { height: 150, background: 'var(--bg-alt)', display: 'grid', placeItems: 'center', borderBottom: '1px solid var(--hairline)' };
