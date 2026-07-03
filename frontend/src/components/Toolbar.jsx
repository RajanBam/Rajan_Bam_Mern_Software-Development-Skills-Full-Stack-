import { TOOLS, CRAYON_COLORS, STROKE_WIDTHS, STICKERS } from '../canvas/constants';

// Hand-drawn floating toolbar. Each tool is a little sketchy button.
const TOOL_LIST = [
  { id: TOOLS.SELECT, label: 'Select', icon: '↖' },
  { id: TOOLS.HAND, label: 'Pan', icon: '✋' },
  { id: TOOLS.DRAW, label: 'Pen', icon: '✏️' },
  { id: TOOLS.RECTANGLE, label: 'Box', icon: '▭' },
  { id: TOOLS.ELLIPSE, label: 'Ellipse', icon: '◯' },
  { id: TOOLS.DIAMOND, label: 'Diamond', icon: '◇' },
  { id: TOOLS.ARROW, label: 'Arrow', icon: '↗' },
  { id: TOOLS.LINE, label: 'Line', icon: '╱' },
  { id: TOOLS.TEXT, label: 'Text', icon: 'T' },
  { id: TOOLS.STICKY, label: 'Sticky', icon: '🗒️' },
  { id: TOOLS.STICKER, label: 'Sticker', icon: '⭐' },
  { id: TOOLS.LASER, label: 'Laser', icon: '🔴' },
  { id: TOOLS.ERASER, label: 'Eraser', icon: '🧽' },
];

export default function Toolbar({ tool, setTool, color, setColor, strokeWidth, setStrokeWidth, sticker, setSticker }) {
  return (
    <div style={wrap}>
      <div style={panel}>
        {TOOL_LIST.map((t) => (
          <button
            key={t.id}
            title={t.label}
            onClick={() => setTool(t.id)}
            style={{ ...toolBtn, ...(tool === t.id ? active : {}) }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
          </button>
        ))}
      </div>

      <div style={panel}>
        {CRAYON_COLORS.map((c) => (
          <button
            key={c}
            title={c}
            onClick={() => setColor(c)}
            style={{
              ...swatch,
              background: c,
              transform: color === c ? 'scale(1.25)' : 'scale(1)',
              boxShadow: color === c ? '0 0 0 2px var(--surface), 0 0 0 4px var(--accent)' : 'none',
            }}
          />
        ))}
      </div>

      <div style={panel}>
        {STROKE_WIDTHS.map((w) => (
          <button key={w} title={`${w}px`} onClick={() => setStrokeWidth(w)} style={{ ...toolBtn, ...(strokeWidth === w ? active : {}) }}>
            <span style={{ display: 'block', width: 20, height: w, borderRadius: 4, background: 'var(--ink)' }} />
          </button>
        ))}
      </div>

      {tool === TOOLS.STICKER && (
        <div style={{ ...panel, flexWrap: 'wrap', maxWidth: 150 }}>
          {STICKERS.map((s) => (
            <button key={s} onClick={() => setSticker(s)} style={{ ...toolBtn, ...(sticker === s ? active : {}) }}>
              <span style={{ fontSize: 18 }}>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const wrap = { position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 5 };
const panel = { display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 16, padding: 8, boxShadow: 'var(--shadow-card)' };
const toolBtn = { width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'transparent', color: 'var(--ink)', transition: 'background 0.15s ease, transform 0.1s ease' };
const active = { background: 'var(--accent)', color: '#fff' };
const swatch = { width: 26, height: 26, borderRadius: '50%', border: '2px solid var(--surface)', transition: 'transform 0.12s ease', margin: '0 auto' };
