import { useCallback, useEffect, useRef, useState } from 'react';
import { renderScene } from '../canvas/renderer';
import {
  TOOLS, SHAPE_TOOLS, HANDLE,
} from '../canvas/constants';
import {
  makeId, makeSeed, getBounds, elementAt, moveElement,
  cornerHandles, resizeElement,
} from '../canvas/geometry';

const DEFAULT_STICKY = 170;

// The interactive whiteboard surface. Owns pan/zoom and all pointer interaction;
// the scene itself (elements) is lifted to the parent so it can be saved & synced.
export default function InkCanvas({
  elements, setElements, commit,
  tool, color, strokeWidth, sticker, onToolReset,
  selectedId, setSelectedId,
  socketSend, remoteCursors = {}, remoteLasers = {},
  readOnly = false,
  showGrid = false, snapToGrid = false,
}) {
  const GRID = 24;
  // Round a world point to the grid when snapping is on.
  const snap = useCallback((p) => (
    snapToGrid ? { x: Math.round(p.x / GRID) * GRID, y: Math.round(p.y / GRID) * GRID } : p
  ), [snapToGrid]);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [view, setView] = useState({ offsetX: 0, offsetY: 0, zoom: 1 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [editing, setEditing] = useState(null); // { id, screenX, screenY, value, type }
  const [localLaser, setLocalLaser] = useState(null);

  // Mutable mirrors so pointer handlers always read the freshest values.
  const elementsRef = useRef(elements);
  elementsRef.current = elements;
  const viewRef = useRef(view);
  viewRef.current = view;
  const drag = useRef(null);
  const lastBroadcast = useRef(0);

  // ---- coordinate helpers ----
  const toWorld = useCallback((clientX, clientY) => {
    const r = containerRef.current.getBoundingClientRect();
    const v = viewRef.current;
    return {
      x: (clientX - r.left - v.offsetX) / v.zoom,
      y: (clientY - r.top - v.offsetY) / v.zoom,
    };
  }, []);
  const toScreen = useCallback((x, y) => {
    const v = viewRef.current;
    return { x: x * v.zoom + v.offsetX, y: y * v.zoom + v.offsetY };
  }, []);

  // ---- sizing (retina aware) ----
  useEffect(() => {
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ width: r.width, height: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- render whenever anything visual changes ----
  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    renderScene(canvas, elementsRef.current, {
      width: size.width, height: size.height, dpr,
      offsetX: view.offsetX, offsetY: view.offsetY, zoom: view.zoom,
      showGrid, gridSize: GRID,
    });
  }, [size, view, showGrid]);

  useEffect(() => { paint(); }, [paint, elements]);

  // Re-paint once the handwriting fonts have arrived.
  useEffect(() => {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
  }, [paint]);

  // ---- broadcast helpers ----
  const broadcastElements = useCallback((els, force = false) => {
    if (readOnly || !socketSend) return;
    const now = Date.now();
    if (force || now - lastBroadcast.current > 55) {
      lastBroadcast.current = now;
      socketSend.elements(els);
    }
  }, [readOnly, socketSend]);

  // ---- pointer down ----
  function onPointerDown(e) {
    if (e.button === 2) return; // right-click reserved for context menu
    containerRef.current.setPointerCapture(e.pointerId);
    const w = toWorld(e.clientX, e.clientY);

    // Panning: hand tool (also used while space is held) or middle mouse.
    if (tool === TOOLS.HAND || e.button === 1) {
      drag.current = { mode: 'pan', startX: e.clientX, startY: e.clientY, orig: { ...viewRef.current } };
      return;
    }

    if (tool === TOOLS.LASER) {
      setLocalLaser([[w.x, w.y]]);
      drag.current = { mode: 'laser' };
      return;
    }

    if (readOnly) { // read-only viewers may only pan
      drag.current = { mode: 'pan', startX: e.clientX, startY: e.clientY, orig: { ...viewRef.current } };
      return;
    }

    if (tool === TOOLS.ERASER) {
      const hit = elementAt(elementsRef.current, w.x, w.y, 8 / viewRef.current.zoom);
      if (hit) {
        setElements((els) => els.filter((el) => el.id !== hit.id));
      }
      drag.current = { mode: 'erase' };
      return;
    }

    if (tool === TOOLS.SELECT) {
      // corner-resize handle?
      if (selectedId) {
        const sel = elementsRef.current.find((el) => el.id === selectedId);
        if (sel && [TOOLS.RECTANGLE, TOOLS.ELLIPSE, TOOLS.DIAMOND, TOOLS.STICKY, TOOLS.STICKER].includes(sel.type)) {
          const handles = cornerHandles(sel);
          for (const [corner, pt] of Object.entries(handles)) {
            const s = toScreen(pt.x, pt.y);
            const sc = toScreen(w.x, w.y);
            if (Math.hypot(s.x - sc.x, s.y - sc.y) <= HANDLE + 4) {
              drag.current = { mode: 'resize', id: sel.id, corner };
              return;
            }
          }
        }
      }
      const hit = elementAt(elementsRef.current, w.x, w.y, 8 / viewRef.current.zoom);
      if (hit) {
        setSelectedId(hit.id);
        drag.current = { mode: 'move', id: hit.id, last: snap(w) };
      } else {
        setSelectedId(null);
      }
      return;
    }

    // ---- creation tools ---- (start point snaps to the grid when enabled)
    const s = snap(w);
    if (SHAPE_TOOLS.has(tool)) {
      const base = { id: makeId(), type: tool, color, strokeWidth, seed: makeSeed() };
      let el;
      if (tool === TOOLS.ARROW || tool === TOOLS.LINE) {
        const startEl = elementAt(elementsRef.current, w.x, w.y, 8 / viewRef.current.zoom);
        el = { ...base, x1: s.x, y1: s.y, x2: s.x, y2: s.y,
          startBinding: startEl && startEl.type !== tool ? startEl.id : null, endBinding: null };
      } else {
        el = { ...base, x: s.x, y: s.y, width: 0, height: 0 };
      }
      setElements((els) => [...els, el]);
      drag.current = { mode: 'create', id: el.id, start: s };
      return;
    }

    if (tool === TOOLS.DRAW) {
      const el = { id: makeId(), type: TOOLS.DRAW, color, strokeWidth, seed: makeSeed(), points: [[w.x, w.y]] };
      setElements((els) => [...els, el]);
      drag.current = { mode: 'freehand', id: el.id };
      return;
    }

    if (tool === TOOLS.TEXT) {
      const el = { id: makeId(), type: TOOLS.TEXT, x: s.x, y: s.y, text: '', color, fontSize: 30, seed: makeSeed() };
      setElements((els) => [...els, el]);
      openEditor(el);
      onToolReset && onToolReset();
      return;
    }

    if (tool === TOOLS.STICKY) {
      // Sticky notes default to a warm paper colour rather than the pen colour.
      const el = { id: makeId(), type: TOOLS.STICKY, x: s.x, y: s.y, width: DEFAULT_STICKY, height: DEFAULT_STICKY, text: '', color: '#ffd93d', seed: makeSeed() };
      setElements((els) => [...els, el]);
      openEditor(el);
      onToolReset && onToolReset();
      return;
    }

    if (tool === TOOLS.STICKER) {
      const el = { id: makeId(), type: TOOLS.STICKER, x: s.x, y: s.y, size: 64, emoji: sticker };
      const next = [...elementsRef.current, el];
      setElements(next);
      commit(next); // pass the snapshot explicitly (state isn't flushed yet this tick)
      broadcastElements(next, true);
      onToolReset && onToolReset();
      return;
    }
  }

  // ---- pointer move ----
  function onPointerMove(e) {
    const w = toWorld(e.clientX, e.clientY);

    // share our cursor with collaborators
    if (!readOnly && socketSend) socketSend.cursor({ x: w.x, y: w.y });

    const d = drag.current;
    if (!d) return;

    if (d.mode === 'pan') {
      setView((v) => ({ ...v, offsetX: d.orig.offsetX + (e.clientX - d.startX), offsetY: d.orig.offsetY + (e.clientY - d.startY) }));
      return;
    }
    if (d.mode === 'laser') {
      setLocalLaser((pts) => {
        const next = [...(pts || []), [w.x, w.y]].slice(-40);
        if (socketSend) socketSend.laser(next);
        return next;
      });
      return;
    }
    if (d.mode === 'erase') {
      const hit = elementAt(elementsRef.current, w.x, w.y, 8 / viewRef.current.zoom);
      if (hit) setElements((els) => els.filter((el) => el.id !== hit.id));
      return;
    }
    if (d.mode === 'create') {
      const sw2 = snap(w);
      setElements((els) => els.map((el) => {
        if (el.id !== d.id) return el;
        if (el.type === TOOLS.ARROW || el.type === TOOLS.LINE) {
          const endEl = elementAt(elementsRef.current, w.x, w.y, 8 / viewRef.current.zoom);
          return { ...el, x2: sw2.x, y2: sw2.y, endBinding: endEl && endEl.id !== el.id && endEl.type !== el.type ? endEl.id : null };
        }
        return { ...el, width: sw2.x - d.start.x, height: sw2.y - d.start.y };
      }));
      broadcastElements(elementsRef.current);
      return;
    }
    if (d.mode === 'freehand') {
      setElements((els) => els.map((el) => (el.id === d.id ? { ...el, points: [...el.points, [w.x, w.y]] } : el)));
      broadcastElements(elementsRef.current);
      return;
    }
    if (d.mode === 'move') {
      const m = snap(w);
      const dx = m.x - d.last.x;
      const dy = m.y - d.last.y;
      if (dx === 0 && dy === 0) return; // wait until we cross a grid step when snapping
      d.last = m;
      setElements((els) => els.map((el) => (el.id === d.id ? moveElement(el, dx, dy) : el)));
      broadcastElements(elementsRef.current);
      return;
    }
    if (d.mode === 'resize') {
      setElements((els) => els.map((el) => (el.id === d.id ? resizeElement(el, d.corner, w.x, w.y) : el)));
      broadcastElements(elementsRef.current);
    }
  }

  // ---- pointer up ----
  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (!d) return;

    if (d.mode === 'laser') { setLocalLaser(null); return; }

    if (d.mode === 'create') {
      // drop shapes that were basically a click (no drag)
      const el = elementsRef.current.find((x) => x.id === d.id);
      if (el) {
        const b = getBounds(el);
        if (b.width < 4 && b.height < 4) {
          setElements((els) => els.filter((x) => x.id !== d.id));
          return;
        }
      }
      onToolReset && onToolReset();
    }

    if (['create', 'freehand', 'move', 'resize', 'erase'].includes(d.mode)) {
      commit();
      broadcastElements(elementsRef.current, true);
    }
  }

  // ---- text / sticky editing overlay ----
  function openEditor(el) {
    const s = toScreen(el.x, el.y);
    setEditing({
      id: el.id, screenX: s.x, screenY: s.y, value: el.text || '', type: el.type,
      fontSize: el.fontSize, textColor: el.color, stickyColor: el.color,
    });
  }
  function onEditChange(value) {
    setEditing((ed) => ({ ...ed, value }));
    setElements((els) => els.map((el) => (el.id === editing.id ? { ...el, text: value } : el)));
  }
  function closeEditor() {
    if (!editing) return;
    const value = editing.value.trim();
    if (!value) {
      setElements((els) => els.filter((el) => el.id !== editing.id));
    } else {
      commit();
      broadcastElements(elementsRef.current, true);
    }
    setEditing(null);
  }

  function onDoubleClick(e) {
    if (readOnly) return;
    const w = toWorld(e.clientX, e.clientY);
    const hit = elementAt(elementsRef.current, w.x, w.y, 8 / viewRef.current.zoom);
    if (hit && (hit.type === TOOLS.TEXT || hit.type === TOOLS.STICKY)) {
      setSelectedId(hit.id);
      openEditor(hit);
    }
  }

  // ---- wheel: zoom (ctrl / pinch) or pan ----
  function onWheel(e) {
    if (e.ctrlKey || e.metaKey) {
      const r = containerRef.current.getBoundingClientRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      setView((v) => {
        const zoom = Math.min(4, Math.max(0.2, v.zoom * (1 - e.deltaY * 0.0015)));
        const k = zoom / v.zoom;
        return { zoom, offsetX: cx - (cx - v.offsetX) * k, offsetY: cy - (cy - v.offsetY) * k };
      });
    } else {
      setView((v) => ({ ...v, offsetX: v.offsetX - e.deltaX, offsetY: v.offsetY - e.deltaY }));
    }
  }

  // Prevent the browser page from zooming on ctrl-wheel over the canvas.
  useEffect(() => {
    const el = containerRef.current;
    const handler = (e) => { if (e.ctrlKey) e.preventDefault(); };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const zoomBy = (factor) => setView((v) => {
    const zoom = Math.min(4, Math.max(0.2, v.zoom * factor));
    const cx = size.width / 2;
    const cy = size.height / 2;
    const k = zoom / v.zoom;
    return { zoom, offsetX: cx - (cx - v.offsetX) * k, offsetY: cy - (cy - v.offsetY) * k };
  });
  const resetView = () => setView({ offsetX: 0, offsetY: 0, zoom: 1 });

  const selected = selectedId ? elements.find((el) => el.id === selectedId) : null;
  const cursorStyle = tool === TOOLS.HAND ? 'grab' : tool === TOOLS.SELECT ? 'default' : 'crosshair';

  return (
    <div
      ref={containerRef}
      className="paper"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'none', cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onDoubleClick={onDoubleClick}
      onWheel={onWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {/* selection outline + handles */}
      {selected && !editing && <SelectionOverlay el={selected} toScreen={toScreen} zoom={view.zoom} />}

      {/* laser trails (local + remote) */}
      <LaserLayer localLaser={localLaser} remoteLasers={remoteLasers} toScreen={toScreen} color={color} />

      {/* collaborators' cursors */}
      {Object.entries(remoteCursors).map(([id, c]) => {
        const s = toScreen(c.x, c.y);
        return <RemoteCursor key={id} x={s.x} y={s.y} name={c.name} color={c.color} />;
      })}

      {/* inline text editor — pointer events are stopped so typing/selecting
          inside the box never leaks down to the canvas (that used to grab and
          drag the element instead of letting you edit). */}
      {editing && (
        <textarea
          autoFocus
          value={editing.value}
          placeholder={editing.type === TOOLS.STICKY ? 'write a note…' : 'type here…'}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={closeEditor}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { e.preventDefault(); closeEditor(); }
            // Enter commits a plain text label; Shift+Enter (and sticky notes) add a newline.
            if (e.key === 'Enter' && !e.shiftKey && editing.type === TOOLS.TEXT) {
              e.preventDefault();
              closeEditor();
            }
          }}
          style={{
            position: 'absolute',
            left: editing.screenX,
            top: editing.type === TOOLS.TEXT ? editing.screenY - 28 * view.zoom : editing.screenY + 8 * view.zoom,
            font: editing.type === TOOLS.TEXT
              ? `${(editing.fontSize || 30) * view.zoom}px 'Caveat', cursive`
              : `${22 * view.zoom}px 'Patrick Hand', cursive`,
            lineHeight: 1.15,
            width: editing.type === TOOLS.STICKY ? (DEFAULT_STICKY - 20) * view.zoom : 260,
            height: editing.type === TOOLS.STICKY ? (DEFAULT_STICKY - 30) * view.zoom : 'auto',
            minHeight: 34,
            border: 'none',
            outline: '2px dashed var(--accent)',
            // Solid, theme-aware surface so the text is always readable (the old
            // translucent white made dark-mode text invisible).
            background: editing.type === TOOLS.STICKY ? (editing.stickyColor || '#ffd93d') : 'var(--surface)',
            color: editing.type === TOOLS.STICKY ? '#3a3a3a' : (editing.textColor || 'var(--ink)'),
            resize: 'none', padding: 6, borderRadius: 6, boxShadow: 'var(--shadow-card)',
            caretColor: 'var(--accent)', zIndex: 20,
          }}
        />
      )}

      {/* zoom controls */}
      <div style={{ position: 'absolute', right: 16, bottom: 16, display: 'flex', gap: 6, alignItems: 'center',
        background: 'var(--surface)', borderRadius: 999, padding: 6, boxShadow: 'var(--shadow-card)', border: '1px solid var(--hairline)' }}>
        <button className="btn" style={{ padding: '4px 12px' }} onClick={() => zoomBy(0.9)}>−</button>
        <button className="btn" style={{ padding: '4px 10px', fontVariantNumeric: 'tabular-nums' }} onClick={resetView}>
          {Math.round(view.zoom * 100)}%
        </button>
        <button className="btn" style={{ padding: '4px 12px' }} onClick={() => zoomBy(1.1)}>+</button>
      </div>
    </div>
  );
}

function SelectionOverlay({ el, toScreen, zoom }) {
  const b = getBounds(el);
  const tl = toScreen(b.x, b.y);
  const w = b.width * zoom;
  const h = b.height * zoom;
  const boxlike = [TOOLS.RECTANGLE, TOOLS.ELLIPSE, TOOLS.DIAMOND, TOOLS.STICKY, TOOLS.STICKER].includes(el.type);
  const handles = boxlike
    ? [[tl.x, tl.y], [tl.x + w, tl.y], [tl.x, tl.y + h], [tl.x + w, tl.y + h]]
    : [];
  return (
    <>
      <div style={{ position: 'absolute', left: tl.x - 4, top: tl.y - 4, width: w + 8, height: h + 8,
        border: '1.5px solid var(--accent)', borderRadius: 6, pointerEvents: 'none' }} />
      {handles.map(([hx, hy], i) => (
        <div key={i} style={{ position: 'absolute', left: hx - HANDLE / 2, top: hy - HANDLE / 2,
          width: HANDLE, height: HANDLE, background: '#fff', border: '1.5px solid var(--accent)', borderRadius: 3, pointerEvents: 'none' }} />
      ))}
    </>
  );
}

function RemoteCursor({ x, y, name, color }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', transform: 'translate(-2px,-2px)', transition: 'left 0.05s linear, top 0.05s linear' }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 2 L3 17 L7.5 12.5 L10.5 19 L13 18 L10 11.5 L17 11 Z" fill={color} stroke="#fff" strokeWidth="1.2" />
      </svg>
      <span style={{ background: color, color: '#fff', fontSize: 11, padding: '1px 7px', borderRadius: 8, fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap' }}>{name}</span>
    </div>
  );
}

function LaserLayer({ localLaser, remoteLasers, toScreen, color }) {
  const trails = [];
  if (localLaser && localLaser.length) trails.push({ points: localLaser, color });
  Object.entries(remoteLasers).forEach(([id, l]) => trails.push({ points: l.points, color: l.color, key: id }));
  if (!trails.length) return null;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {trails.map((t, i) => {
        const pts = t.points.map((p) => { const s = toScreen(p[0], p[1]); return `${s.x},${s.y}`; }).join(' ');
        return (
          <polyline key={t.key || i} points={pts} fill="none" stroke={t.color} strokeWidth="4"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.85"
            style={{ filter: `drop-shadow(0 0 6px ${t.color})` }} />
        );
      })}
    </svg>
  );
}
