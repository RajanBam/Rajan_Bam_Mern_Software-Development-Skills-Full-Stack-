import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InkCanvas from '../components/InkCanvas';
import Toolbar from '../components/Toolbar';
import { useHistory } from '../hooks/useHistory';
import { useBoardSocket } from '../hooks/useBoardSocket';
import { getBoard, saveBoard } from '../api/boards';
import { exportPNG } from '../canvas/renderer';
import { TOOLS, STICKERS } from '../canvas/constants';
import { useTheme } from '../context/ThemeContext';

// Hotkeys: letter -> tool
const HOTKEYS = {
  v: TOOLS.SELECT, h: TOOLS.HAND, p: TOOLS.DRAW, d: TOOLS.DRAW,
  r: TOOLS.RECTANGLE, o: TOOLS.ELLIPSE, g: TOOLS.DIAMOND,
  a: TOOLS.ARROW, l: TOOLS.LINE, t: TOOLS.TEXT, s: TOOLS.STICKY, e: TOOLS.ERASER,
};

export default function BoardEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const { elements, elementsRef, setElements, commit, undo, redo, reset, canUndo, canRedo } = useHistory([]);
  const [tool, setTool] = useState(TOOLS.SELECT);
  const [color, setColor] = useState('#1d1d1f');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [selectedId, setSelectedId] = useState(null);
  const [spaceHeld, setSpaceHeld] = useState(false);

  const [board, setBoard] = useState(null);
  const [title, setTitle] = useState('');
  const [saveState, setSaveState] = useState('saved'); // saved | saving | dirty
  const [shareCopied, setShareCopied] = useState(false);

  // Merge scene changes coming from other collaborators.
  const onRemoteElements = useCallback((els) => reset(els), [reset]);
  const { peers, cursors, lasers, send } = useBoardSocket(id, onRemoteElements);

  // ---- load the board ----
  useEffect(() => {
    let active = true;
    getBoard(id)
      .then((b) => {
        if (!active) return;
        setBoard(b);
        setTitle(b.title);
        reset(b.elements || []);
      })
      .catch(() => navigate('/app'));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---- debounced autosave ----
  const saveTimer = useRef(null);
  const markDirty = useCallback(() => {
    setSaveState('dirty');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState('saving');
      try {
        const thumbnail = makeThumbnail(elementsRef.current);
        await saveBoard(id, { elements: elementsRef.current, title, thumbnail });
        setSaveState('saved');
      } catch {
        setSaveState('dirty');
      }
    }, 900);
  }, [id, title, elementsRef]);

  // Save whenever the committed scene or title changes.
  useEffect(() => {
    if (board) markDirty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, title]);

  // ---- keyboard shortcuts ----
  useEffect(() => {
    function onKey(e) {
      const typing = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      if (typing) return;
      if (e.key === ' ') { setSpaceHeld(true); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        setElements((els) => els.filter((el) => el.id !== selectedId));
        setSelectedId(null);
        commit();
        return;
      }
      const t = HOTKEYS[e.key.toLowerCase()];
      if (t) setTool(t);
    }
    function onKeyUp(e) { if (e.key === ' ') setSpaceHeld(false); }
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp); };
  }, [selectedId, undo, redo, commit, setElements]);

  function handleExport() {
    const url = exportPNG(elements);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'inkboard'}.png`;
    a.click();
  }

  async function handleShare() {
    const next = !board.isPublic;
    const updated = await saveBoard(id, { isPublic: next });
    setBoard((b) => ({ ...b, isPublic: next, shareId: updated.shareId }));
    if (next) {
      const url = `${window.location.origin}/shared/${updated.shareId}`;
      navigator.clipboard?.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }

  if (!board) return <div style={{ padding: 80, textAlign: 'center' }} className="hand">opening board…</div>;

  const effectiveTool = spaceHeld ? TOOLS.HAND : tool;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)' }}>
      {/* top bar */}
      <div style={topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-soft" style={{ padding: '6px 14px' }} onClick={() => navigate('/app')}>← Boards</button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={titleInput}
            className="marker"
          />
          <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
            {saveState === 'saving' ? 'saving…' : saveState === 'dirty' ? 'unsaved' : 'all changes saved'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PresenceBar peers={peers} />
          <button className="btn btn-soft" style={{ padding: '6px 12px' }} title="Undo" onClick={undo} disabled={!canUndo}>↶</button>
          <button className="btn btn-soft" style={{ padding: '6px 12px' }} title="Redo" onClick={redo} disabled={!canRedo}>↷</button>
          <button className="btn btn-soft" style={{ padding: '6px 12px' }} onClick={toggle} title="Theme">{theme === 'light' ? '🌙' : '☀️'}</button>
          <button className="btn btn-soft" style={{ padding: '6px 14px' }} onClick={handleExport}>Export PNG</button>
          <button className="btn btn-primary" style={{ padding: '6px 16px' }} onClick={handleShare}>
            {shareCopied ? 'Link copied!' : board.isPublic ? 'Public ✓' : 'Share'}
          </button>
        </div>
      </div>

      {/* the board */}
      <div style={{ position: 'absolute', inset: 0, top: 56 }}>
        <Toolbar
          tool={tool} setTool={setTool}
          color={color} setColor={setColor}
          strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth}
          sticker={sticker} setSticker={setSticker}
        />
        <InkCanvas
          elements={elements}
          setElements={setElements}
          commit={commit}
          tool={effectiveTool}
          color={color}
          strokeWidth={strokeWidth}
          sticker={sticker}
          onToolReset={() => setTool(TOOLS.SELECT)}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          socketSend={send}
          remoteCursors={cursors}
          remoteLasers={lasers}
        />
      </div>
    </div>
  );
}

function PresenceBar({ peers }) {
  if (!peers || peers.length <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {peers.slice(0, 5).map((p, i) => (
        <div key={i} title={p.name} style={{
          width: 28, height: 28, borderRadius: '50%', background: p.color, color: '#fff',
          display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600,
          marginLeft: i ? -8 : 0, border: '2px solid var(--surface)',
        }}>{p.name?.[0]?.toUpperCase()}</div>
      ))}
      <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--ink-soft)' }}>{peers.length} here</span>
    </div>
  );
}

// Build a small PNG preview (max 360px wide) for the dashboard cards.
function makeThumbnail(elements) {
  const full = exportPNG(elements, 30);
  if (!full) return '';
  return full; // the board pages downscale on display; kept simple here
}

const topbar = {
  position: 'absolute', top: 0, left: 0, right: 0, height: 56, zIndex: 6,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
  background: 'color-mix(in srgb, var(--surface) 82%, transparent)', backdropFilter: 'saturate(180%) blur(20px)',
  borderBottom: '1px solid var(--hairline)',
};
const titleInput = { fontSize: 20, fontWeight: 400, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', width: 220 };
