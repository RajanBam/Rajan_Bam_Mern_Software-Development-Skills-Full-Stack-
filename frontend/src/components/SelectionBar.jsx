import { TOOLS } from '../canvas/constants';

// Floating action bar shown whenever an element is selected. Gives quick,
// visible buttons for the things you'd otherwise need to remember shortcuts for.
export default function SelectionBar({ selected, onDuplicate, onFront, onBack, onDelete, onFontDelta }) {
  const isText = selected.type === TOOLS.TEXT;
  return (
    <div style={wrap}>
      <span className="hand" style={{ fontSize: 17, color: 'var(--ink-soft)', padding: '0 6px' }}>
        {label(selected.type)}
      </span>
      <Divider />
      {isText && (
        <>
          <Btn title="Smaller text" onClick={() => onFontDelta(-4)}>A−</Btn>
          <Btn title="Bigger text" onClick={() => onFontDelta(4)}>A+</Btn>
          <Divider />
        </>
      )}
      <Btn title="Duplicate (Ctrl/⌘+D)" onClick={onDuplicate}>⧉</Btn>
      <Btn title="Bring to front (])" onClick={onFront}>⬆</Btn>
      <Btn title="Send to back ([)" onClick={onBack}>⬇</Btn>
      <Divider />
      <Btn title="Delete (Del)" onClick={onDelete} danger>🗑</Btn>
    </div>
  );
}

function label(type) {
  const map = {
    rectangle: 'Box', ellipse: 'Ellipse', diamond: 'Diamond', arrow: 'Arrow',
    line: 'Line', draw: 'Ink', text: 'Text', sticky: 'Sticky', sticker: 'Sticker',
  };
  return map[type] || 'Shape';
}

function Btn({ children, onClick, title, danger }) {
  return (
    <button className="btn" title={title} onClick={onClick}
      style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 16, color: danger ? 'var(--crayon-red)' : 'var(--ink)' }}>
      {children}
    </button>
  );
}
const Divider = () => <span style={{ width: 1, height: 24, background: 'var(--hairline)' }} />;

const wrap = {
  position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 5,
  display: 'flex', alignItems: 'center', gap: 4, padding: 6,
  background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 14, boxShadow: 'var(--shadow-float)',
};
