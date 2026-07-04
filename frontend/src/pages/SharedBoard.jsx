import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import InkCanvas from '../components/InkCanvas';
import { getSharedBoard } from '../api/boards';
import { TOOLS } from '../canvas/constants';

// Public, read-only view of a board. Visitors can pan, zoom and use the laser
// pointer, but cannot edit. No auth required.
export default function SharedBoard() {
  const { shareId } = useParams();
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');
  const [tool, setTool] = useState(TOOLS.HAND);
  const [elements, setElements] = useState([]);

  useEffect(() => {
    getSharedBoard(shareId)
      .then((b) => { setBoard(b); setElements(b.elements || []); })
      .catch((e) => setError(e.message));
  }, [shareId]);

  if (error) {
    return (
      <div className="paper" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 54 }}>🔒</div>
          <h1 className="marker" style={{ fontSize: 30 }}>{error}</h1>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Go home</Link>
        </div>
      </div>
    );
  }
  if (!board) return <div style={{ padding: 80, textAlign: 'center' }} className="hand">loading…</div>;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)' }}>
      <div style={bar}>
        <span className="marker" style={{ fontSize: 22 }}>🖍️ {board.title}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-soft" style={{ padding: '6px 12px' }}
            onClick={() => setTool(tool === TOOLS.LASER ? TOOLS.HAND : TOOLS.LASER)}>
            {tool === TOOLS.LASER ? '✋ Pan' : '🔴 Laser'}
          </button>
          <Link to="/register" className="btn btn-primary" style={{ padding: '6px 14px' }}>Make your own</Link>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, top: 52 }}>
        <InkCanvas
          elements={elements}
          setElements={setElements}
          commit={() => {}}
          tool={tool}
          color="#ff3b30"
          strokeWidth={4}
          sticker="⭐"
          selectedId={null}
          setSelectedId={() => {}}
          readOnly
        />
      </div>
      <div style={{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', fontSize: 12, color: 'var(--ink-soft)', background: 'var(--surface)', padding: '4px 12px', borderRadius: 999, border: '1px solid var(--hairline)' }}>
        Read-only · scroll to pan, ⌘/Ctrl + scroll to zoom
      </div>
    </div>
  );
}

const bar = {
  position: 'absolute', top: 0, left: 0, right: 0, height: 52, zIndex: 6,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
  background: 'color-mix(in srgb, var(--surface) 82%, transparent)', backdropFilter: 'saturate(180%) blur(20px)',
  borderBottom: '1px solid var(--hairline)',
};
