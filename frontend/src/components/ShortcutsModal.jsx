// A friendly, hand-drawn cheat-sheet of keyboard shortcuts (press ? to toggle).
const GROUPS = [
  {
    title: 'Tools',
    items: [
      ['V', 'Select'], ['H', 'Pan / hand'], ['P or D', 'Pen'], ['R', 'Rectangle'],
      ['O', 'Ellipse'], ['G', 'Diamond'], ['A', 'Arrow'], ['L', 'Line'],
      ['T', 'Text'], ['S', 'Sticky note'], ['E', 'Eraser'],
    ],
  },
  {
    title: 'Edit',
    items: [
      ['Ctrl/⌘ + Z', 'Undo'], ['Ctrl/⌘ + Shift + Z', 'Redo'],
      ['Ctrl/⌘ + D', 'Duplicate'], ['Ctrl/⌘ + C / V', 'Copy / paste'],
      [']', 'Bring to front'], ['[', 'Send to back'], ['Delete', 'Remove selected'],
    ],
  },
  {
    title: 'View',
    items: [
      ['Space + drag', 'Pan the canvas'], ['Ctrl/⌘ + scroll', 'Zoom'],
      ['Scroll', 'Pan up/down/side'], ['?', 'This help'], ['Esc', 'Close / exit present'],
    ],
  },
];

export default function ShortcutsModal({ onClose }) {
  return (
    <div onClick={onClose} style={backdrop}>
      <div onClick={(e) => e.stopPropagation()} style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 className="marker" style={{ fontSize: 30 }}>⌨️ Keyboard shortcuts</h2>
          <button className="btn btn-soft" style={{ padding: '4px 12px' }} onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 22 }}>
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h3 className="hand" style={{ fontSize: 22, color: 'var(--accent)', marginBottom: 8 }}>{g.title}</h3>
              {g.items.map(([k, label]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '4px 0', fontSize: 15 }}>
                  <span style={{ color: 'var(--ink-soft)' }}>{label}</span>
                  <kbd style={kbd}>{k}</kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const backdrop = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 20 };
const card = { background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 22, padding: 28, maxWidth: 720, width: '100%', boxShadow: 'var(--shadow-float)' };
const kbd = { fontFamily: 'var(--font-ui)', fontSize: 12, background: 'var(--bg-alt)', border: '1px solid var(--hairline)', borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap' };
