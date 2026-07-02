// Draws a scene of elements onto a 2D canvas with a hand-drawn look.
// rough.js gives the wobbly-pencil shapes; perfect-freehand gives smooth ink.

import rough from 'roughjs';
import { getStroke } from 'perfect-freehand';
import { TOOLS } from './constants';
import { getBounds, resolveArrowEndpoints } from './geometry';

// perfect-freehand outline -> a filled Path2D
function freehandPath(points, size) {
  const stroke = getStroke(points, {
    size: size * 2.2,
    thinning: 0.6,
    smoothing: 0.6,
    streamline: 0.5,
    simulatePressure: true,
  });
  if (!stroke.length) return null;
  // Build the outline as a smooth chain of quadratic segments.
  let dStr = `M ${stroke[0][0]} ${stroke[0][1]} Q`;
  for (let i = 0; i < stroke.length; i += 1) {
    const [x0, y0] = stroke[i];
    const [x1, y1] = stroke[(i + 1) % stroke.length];
    dStr += ` ${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2}`;
  }
  dStr += ' Z';
  return new Path2D(dStr);
}

function drawArrowhead(ctx, x1, y1, x2, y2, color, size) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 10 + size * 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - len * Math.cos(angle - 0.4), y2 - len * Math.sin(angle - 0.4));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - len * Math.cos(angle + 0.4), y2 - len * Math.sin(angle + 0.4));
  ctx.stroke();
}

function wrapText(ctx, text, maxWidth) {
  const words = (text || '').split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

// Draw a single element. rc is a rough.canvas instance bound to the ctx's canvas.
export function drawElement(ctx, rc, el, byId) {
  const color = el.color || '#1d1d1f';
  const sw = el.strokeWidth || 3;
  const seed = el.seed || 1;
  const b = getBounds(el);

  switch (el.type) {
    case TOOLS.RECTANGLE:
      rc.rectangle(b.x, b.y, b.width, b.height, { stroke: color, strokeWidth: sw, roughness: 1.4, seed, bowing: 1.3 });
      break;
    case TOOLS.ELLIPSE:
      rc.ellipse(b.x + b.width / 2, b.y + b.height / 2, b.width, b.height, {
        stroke: color, strokeWidth: sw, roughness: 1.4, seed, bowing: 1.2,
      });
      break;
    case TOOLS.DIAMOND: {
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      rc.polygon(
        [[cx, b.y], [b.x + b.width, cy], [cx, b.y + b.height], [b.x, cy]],
        { stroke: color, strokeWidth: sw, roughness: 1.4, seed, bowing: 1.2 }
      );
      break;
    }
    case TOOLS.LINE:
    case TOOLS.ARROW: {
      const { x1, y1, x2, y2 } = resolveArrowEndpoints(el, byId);
      rc.line(x1, y1, x2, y2, { stroke: color, strokeWidth: sw, roughness: 1.2, seed, bowing: 1.5 });
      if (el.type === TOOLS.ARROW) drawArrowhead(ctx, x1, y1, x2, y2, color, sw);
      break;
    }
    case TOOLS.DRAW: {
      const path = freehandPath(el.points, sw);
      if (path) {
        ctx.fillStyle = color;
        ctx.fill(path);
      }
      break;
    }
    case TOOLS.STICKY: {
      // paper with a soft shadow + folded corner, then handwriting
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      rc.rectangle(b.x, b.y, b.width, b.height, {
        fill: el.color || '#ffd93d', fillStyle: 'solid', stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1, roughness: 1.1, seed,
      });
      ctx.restore();
      ctx.fillStyle = '#3a3a3a';
      ctx.font = '22px Patrick Hand, cursive';
      ctx.textBaseline = 'top';
      wrapText(ctx, el.text, b.width - 24).forEach((line, i) => {
        ctx.fillText(line, b.x + 12, b.y + 14 + i * 26);
      });
      break;
    }
    case TOOLS.TEXT: {
      ctx.fillStyle = color;
      ctx.font = `${el.fontSize || 28}px Caveat, cursive`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(el.text || '', el.x, el.y);
      break;
    }
    case TOOLS.STICKER: {
      ctx.font = `${el.size || 64}px serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(el.emoji || '⭐', el.x, el.y);
      break;
    }
    default:
      break;
  }
}

// Full-scene render with pan (offsetX/Y) and zoom.
export function renderScene(canvas, elements, viewport) {
  const ctx = canvas.getContext('2d');
  const { width, height, dpr, offsetX, offsetY, zoom } = viewport;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(offsetX * dpr, offsetY * dpr);
  ctx.scale(zoom * dpr, zoom * dpr);

  const rc = rough.canvas(canvas);
  const byId = Object.fromEntries(elements.map((e) => [e.id, e]));
  elements.forEach((el) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawElement(ctx, rc, el, byId);
  });
  ctx.restore();
}

// Render just the drawing (no UI) into a data-URL PNG, cropped to content.
export function exportPNG(elements, padding = 40) {
  if (!elements.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  elements.forEach((el) => {
    const b = getBounds(el);
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  });
  const w = maxX - minX + padding * 2;
  const h = maxY - minY + padding * 2;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  renderScene(canvas, elements, {
    width: w, height: h, dpr: 1, offsetX: -minX + padding, offsetY: -minY + padding, zoom: 1,
  });
  return canvas.toDataURL('image/png');
}
