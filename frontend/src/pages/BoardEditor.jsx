import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InkCanvas from '../components/InkCanvas';
import Toolbar from '../components/Toolbar';
import ShortcutsModal from '../components/ShortcutsModal';
import SelectionBar from '../components/SelectionBar';
import { useHistory } from '../hooks/useHistory';
import { useBoardSocket } from '../hooks/useBoardSocket';
import { getBoard, saveBoard } from '../api/boards';
import { exportPNG, exportSVG } from '../canvas/renderer';
import { makeId, moveElement } from '../canvas/geometry';
import { TOOLS, STICKERS } from '../canvas/constants';
import { useTheme } from '../context/ThemeContext';

// Hotkeys: letter -> tool
const HOTKEYS = {
  v: TOOLS.SELECT, h: TOOLS.HAND, p: TOOLS.DRAW, d: TOOLS.DRAW,
  r: TOOLS.RECTANGLE, o: TOOLS.ELLIPSE, g: TOOLS.DIAMOND,
  a: TOOLS.ARROW, l: TOOLS.LINE, t: TOOLS.TEXT, s: TOOLS.STICKY, e: TOOLS.ERASER,
};

const cloneEl = (el) => ({ ...el, id: makeId(), points: el.points ? el.points.map((p) => [...p]) : undefined });

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

  // ---- non-database view features ----
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const clipboard = useRef(null);

  const [board, setBoard] = useState(null);
  const [title, setTitle] = useState('');
  const [saveState, setSaveState] = useState('saved');
  const [shareCopied, setShareCopied] = useState(false);
  const [toast, setToast] = useState('');

  const flash = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(''), 1600); }, []);

  const onRemoteElements = useCallback((els) => reset(els), [reset]);
  const { peers, cursors, lasers, send } = useBoardSocket(id, onRemoteElements);

  // ---- load ----
  useEffect(() => {
    let active = true;
    getBoard(id)
      .then((b) => { if (!active) return; setBoard(b); setTitle(b.title); reset(b.elements || []); })
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
        await saveBoard(id, { elements: elementsRef.current, title, thumbnail: exportPNG(elementsRef.current, 30) || '' });
        setSaveState('saved');
      } catch { setSaveState('dirty'); }
    }, 900);
  }, [id, title, elementsRef]);

  useEffect(() => { if (board) markDirty(); /* eslint-disable-next-line */ }, [elements, title]);

  // ---- selection operations (all client-side) ----
  const selected = selectedId ? elements.find((el) => el.id === selectedId) : null;

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setElements((els) => els.filter((el) => el.id !== selectedId));
    setSelectedId(null);
    commit();
  }, [selectedId, setElements, commit]);

  const duplicateSelected = useCallback(() => {
    const el = elementsRef.current.find((e) => e.id === selectedId);
    if (!el) return;
    const copy = moveElement(cloneEl(el), 18, 18);
    setElements((els) => [...els, copy]);
    setSelectedId(copy.id);
    commit();
    flash('Duplicated');
  }, [selectedId, elementsRef, setElements, commit, flash]);

  const bringToFront = useCallback(() => {
    if (!selectedId) return;
    setElements((els) => { const el = els.find((e) => e.id === selectedId); return el ? [...els.filter((e) => e.id !== selectedId), el] : els; });
    commit();
  }, [selectedId, setElements, commit]);

  const sendToBack = useCallback(() => {
    if (!selectedId) return;
    setElements((els) => { const el = els.find((e) => e.id === selectedId); return el ? [el, ...els.filter((e) => e.id !== selectedId)] : els; });
    commit();
  }, [selectedId, setElements, commit]);

  const changeFont = useCallback((delta) => {
    if (!selected || selected.type !== TOOLS.TEXT) return;
    setElements((els) => els.map((el) => (el.id === selectedId ? { ...el, fontSize: Math.max(12, Math.min(120, (el.fontSize || 30) + delta)) } : el)));
    commit();
  }, [selected, selectedId, setElements, commit]);

  // Clicking a colour/width recolours the current selection too.
  const applyColor = useCallback((c) => {
    setColor(c);
    if (selectedId) { setElements((els) => els.map((el) => (el.id === selectedId ? { ...el, color: c } : el))); commit(); }
  }, [selectedId, setElements, commit]);
  const applyStroke = useCallback((wdt) => {
    setStrokeWidth(wdt);
    if (selectedId) { setElements((els) => els.map((el) => (el.id === selectedId ? { ...el, strokeWidth: wdt } : el))); commit(); }
  }, [selectedId, setElements, commit]);

  // ---- keyboard shortcuts ----
  useEffect(() => {
    function onKey(e) {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === ' ') { setSpaceHeld(true); return; }
      if (e.key === '?') { setShowShortcuts((s) => !s); return; }
      if (e.key === 'Escape') { setPresenting(false); setShowShortcuts(false); return; }
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSelected(); return; }
      if (mod && e.key.toLowerCase() === 'c') { if (selected) clipboard.current = selected; return; }
      if (mod && e.key.toLowerCase() === 'v') {
        if (clipboard.current) {
          const copy = moveElement(cloneEl(clipboard.current), 24, 24);
          setElements((els) => [...els, copy]); setSelectedId(copy.id); commit(); flash('Pasted');
        }
        return;
      }
      if (e.key === ']') { bringToFront(); return; }
      if (e.key === '[') { sendToBack(); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { deleteSelected(); return; }
      const t = HOTKEYS[e.key.toLowerCase()];
      if (t) setTool(t);
    }
    function onKeyUp(e) { if (e.key === ' ') setSpaceHeld(false); }
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp); };
  }, [selected, selectedId, undo, redo, duplicateSelected, deleteSelected, bringToFront, sendToBack, setElements, commit, flash]);

  function download(href, name) { const a = document.createElement('a'); a.href = href; a.download = name; a.click(); }
  function handleExportPNG() { const url = exportPNG(elements); if (url) download(url, `${title || 'inkboard'}.png`); }
  function handleExportSVG() {
    const svg = exportSVG(elements);
    if (svg) download(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, `${title || 'inkboard'}.svg`);
  }

  async function handleShare() {
    const next = !board.isPublic;
    const updated = await saveBoard(id, { isPublic: next });
    setBoard((b) => ({ ...b, isPublic: next, shareId: updated.shareId }));
    if (next) {
      navigator.clipboard?.writeText(`${window.location.origin}/shared/${updated.shareId}`);
      setShareCopied(true); setTimeout(() => setShareCopied(false), 2000);
    }
  }

  function togglePresent() {
    const next = !presenting;
    setPresenting(next);
    if (next) { setTool(TOOLS.LASER); document.documentElement.requestFullscreen?.().catch(() => {}); }
    else { setTool(TOOLS.SELECT); document.exitFullscreen?.().catch(() => {}); }
  }

  if (!board) return <div style={{ padding: 80, textAlign: 'center' }} className="hand">opening board…</div>;

  const effectiveTool = spaceHeld ? TOOLS.HAND : tool;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)' }}>
      {!presenting && (
        <div style={topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button className="btn btn-soft" style={{ padding: '6px 14px' }} onClick={() => navigate('/app')}>← Boards</button>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={titleInput} className="marker" />
            <span style={{ fontSize: 13, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
              {saveState === 'saving' ? 'saving…' : saveState === 'dirty' ? 'unsaved' : 'saved ✓'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <PresenceBar peers={peers} />
            <Tog on={showGrid} onClick={() => setShowGrid((v) => !v)} title="Grid">▦</Tog>
            <Tog on={snapToGrid} onClick={() => setSnapToGrid((v) => !v)} title="Snap to grid">🧲</Tog>
            <button className="btn btn-soft" style={sq} title="Undo" onClick={undo} disabled={!canUndo}>↶</button>
            <button className="btn btn-soft" style={sq} title="Redo" onClick={redo} disabled={!canRedo}>↷</button>
            <button className="btn btn-soft" style={sq} title="Keyboard shortcuts (?)" onClick={() => setShowShortcuts(true)}>⌨</button>
            <button className="btn btn-soft" style={sq} title="Present" onClick={togglePresent}>▶</button>
            <button className="btn btn-soft" style={sq} title="Theme" onClick={toggle}>{theme === 'light' ? '🌙' : '☀️'}</button>
            <button className="btn btn-soft" style={{ padding: '6px 12px' }} onClick={handleExportSVG}>SVG</button>
            <button className="btn btn-soft" style={{ padding: '6px 12px' }} onClick={handleExportPNG}>PNG</button>
            <button className="btn btn-primary" style={{ padding: '6px 16px' }} onClick={handleShare}>
              {shareCopied ? 'Link copied!' : board.isPublic ? 'Public ✓' : 'Share'}
            </button>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', inset: 0, top: presenting ? 0 : 56 }}>
        {!presenting && (
          <Toolbar
            tool={tool} setTool={setTool}
            color={color} setColor={applyColor}
            strokeWidth={strokeWidth} setStrokeWidth={applyStroke}
            sticker={sticker} setSticker={setSticker}
          />
        )}

        {!presenting && selected && (
          <SelectionBar
            selected={selected}
            onDuplicate={duplicateSelected}
            onFront={bringToFront}
            onBack={sendToBack}
            onDelete={deleteSelected}
            onFontDelta={changeFont}
          />
        )}

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
          showGrid={showGrid}
          snapToGrid={snapToGrid}
        />
      </div>

      {presenting && (
        <button className="btn btn-primary" style={{ position: 'absolute', top: 16, right: 16, zIndex: 30 }} onClick={togglePresent}>
          Exit presentation (Esc)
        </button>
      )}

      {toast && (
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: 'var(--bg)', padding: '8px 18px', borderRadius: 999, zIndex: 40, fontSize: 14 }}>{toast}</div>
      )}

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}

function Tog({ on, onClick, title, children }) {
  return (
    <button className="btn" title={title} onClick={onClick}
      style={{ ...sq, background: on ? 'var(--accent)' : 'var(--bg-alt)', color: on ? '#fff' : 'var(--ink)', border: '1px solid var(--hairline)' }}>
      {children}
    </button>
  );
}

function PresenceBar({ peers }) {
  if (!peers || peers.length <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
      {peers.slice(0, 5).map((p, i) => (
        <div key={i} title={p.name} style={{ width: 28, height: 28, borderRadius: '50%', background: p.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600, marginLeft: i ? -8 : 0, border: '2px solid var(--surface)' }}>{p.name?.[0]?.toUpperCase()}</div>
      ))}
      <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--ink-soft)' }}>{peers.length} here</span>
    </div>
  );
}

const topbar = {
  position: 'absolute', top: 0, left: 0, right: 0, minHeight: 56, zIndex: 6,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', gap: 12,
  background: 'color-mix(in srgb, var(--surface) 82%, transparent)', backdropFilter: 'saturate(180%) blur(20px)',
  borderBottom: '1px solid var(--hairline)',
};
const titleInput = { fontSize: 22, fontWeight: 400, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', width: 200 };
const sq = { padding: '6px 11px' };
