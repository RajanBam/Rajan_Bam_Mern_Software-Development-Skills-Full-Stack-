// Pure geometry helpers: bounding boxes, hit-testing, moving, resizing, bindings.
// Everything here works in "world" coordinates (before pan/zoom is applied).

import { TOOLS } from './constants';

let counter = 0;
export function makeId() {
  counter += 1;
  return `el_${Date.now().toString(36)}_${counter}`;
}

// A stable per-element seed keeps rough.js from re-wobbling on every repaint.
export function makeSeed() {
  return Math.floor(Math.random() * 2 ** 31);
}

// Axis-aligned bounding box { x, y, width, height } for any element.
export function getBounds(el) {
  switch (el.type) {
    case TOOLS.ARROW:
    case TOOLS.LINE: {
      const x = Math.min(el.x1, el.x2);
      const y = Math.min(el.y1, el.y2);
      return { x, y, width: Math.abs(el.x2 - el.x1), height: Math.abs(el.y2 - el.y1) };
    }
    case TOOLS.DRAW: {
      const xs = el.points.map((p) => p[0]);
      const ys = el.points.map((p) => p[1]);
      const x = Math.min(...xs);
      const y = Math.min(...ys);
      return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
    }
    case TOOLS.TEXT: {
      const w = (el.text || ' ').length * (el.fontSize || 28) * 0.55;
      return { x: el.x, y: el.y - (el.fontSize || 28), width: Math.max(w, 20), height: (el.fontSize || 28) * 1.3 };
    }
    case TOOLS.STICKER: {
      return { x: el.x, y: el.y, width: el.size || 64, height: el.size || 64 };
    }
    default: {
      // rectangle / ellipse / diamond / sticky — normalise negative sizes
      const x = el.width < 0 ? el.x + el.width : el.x;
      const y = el.height < 0 ? el.y + el.height : el.y;
      return { x, y, width: Math.abs(el.width), height: Math.abs(el.height) };
    }
  }
}

export function getCenter(el) {
  const b = getBounds(el);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

function pointNearSegment(px, py, x1, y1, x2, y2, tol) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy) <= tol;
}

// Is world-point (px,py) on/inside this element? tol is in world units.
export function hitTest(el, px, py, tol = 6) {
  if (el.type === TOOLS.ARROW || el.type === TOOLS.LINE) {
    return pointNearSegment(px, py, el.x1, el.y1, el.x2, el.y2, tol + (el.strokeWidth || 2));
  }
  if (el.type === TOOLS.DRAW) {
    for (let i = 1; i < el.points.length; i += 1) {
      const [x1, y1] = el.points[i - 1];
      const [x2, y2] = el.points[i];
      if (pointNearSegment(px, py, x1, y1, x2, y2, tol + (el.strokeWidth || 2))) return true;
    }
    return false;
  }
  const b = getBounds(el);
  return px >= b.x - tol && px <= b.x + b.width + tol && py >= b.y - tol && py <= b.y + b.height + tol;
}

// Return the topmost element under a point (last in array is on top).
export function elementAt(elements, px, py, tol = 6) {
  for (let i = elements.length - 1; i >= 0; i -= 1) {
    if (hitTest(elements[i], px, py, tol)) return elements[i];
  }
  return null;
}

// Translate an element by (dx, dy) in world units, returning a new object.
export function moveElement(el, dx, dy) {
  switch (el.type) {
    case TOOLS.ARROW:
    case TOOLS.LINE:
      return { ...el, x1: el.x1 + dx, y1: el.y1 + dy, x2: el.x2 + dx, y2: el.y2 + dy };
    case TOOLS.DRAW:
      return { ...el, points: el.points.map((p) => [p[0] + dx, p[1] + dy]) };
    default:
      return { ...el, x: el.x + dx, y: el.y + dy };
  }
}

// The four corner handles (world coords) for a box-like element's bounds.
export function cornerHandles(el) {
  const b = getBounds(el);
  return {
    nw: { x: b.x, y: b.y },
    ne: { x: b.x + b.width, y: b.y },
    sw: { x: b.x, y: b.y + b.height },
    se: { x: b.x + b.width, y: b.y + b.height },
  };
}

// Resize a box-like element by dragging a corner to (px,py).
export function resizeElement(el, corner, px, py) {
  const b = getBounds(el);
  let { x, y, width, height } = b;
  if (corner.includes('e')) width = Math.max(10, px - b.x);
  if (corner.includes('s')) height = Math.max(10, py - b.y);
  if (corner.includes('w')) {
    width = Math.max(10, b.x + b.width - px);
    x = px;
  }
  if (corner.includes('n')) {
    height = Math.max(10, b.y + b.height - py);
    y = py;
  }
  return { ...el, x, y, width, height };
}

// When an arrow is bound to shapes, snap its endpoints to those shapes' centres.
// Called at render time so arrows follow shapes as they move.
export function resolveArrowEndpoints(el, byId) {
  let { x1, y1, x2, y2 } = el;
  if (el.startBinding && byId[el.startBinding]) {
    const c = getCenter(byId[el.startBinding]);
    x1 = c.x;
    y1 = c.y;
  }
  if (el.endBinding && byId[el.endBinding]) {
    const c = getCenter(byId[el.endBinding]);
    x2 = c.x;
    y2 = c.y;
  }
  // Pull the endpoints back to the box edges so the line doesn't stab the centre.
  if (el.startBinding && byId[el.startBinding]) {
    [x1, y1] = clampToBox(byId[el.startBinding], x1, y1, x2, y2);
  }
  if (el.endBinding && byId[el.endBinding]) {
    [x2, y2] = clampToBox(byId[el.endBinding], x2, y2, x1, y1);
  }
  return { x1, y1, x2, y2 };
}

// Move a point that sits at a box centre outward to the box border, toward target.
function clampToBox(el, cx, cy, tx, ty) {
  const b = getBounds(el);
  const hw = b.width / 2;
  const hh = b.height / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return [cx, cy];
  const scale = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh || 0.0001);
  return [cx + dx * scale, cy + dy * scale];
}
