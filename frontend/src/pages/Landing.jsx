import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReveal } from '../hooks/useReveal';
import Navbar from '../components/Navbar';
import '../styles/landing.css';

const FEATURES = [
  { emoji: '✍️', title: 'Hand-drawn, always', text: 'Every box, arrow and doodle is rendered in a wobbly-pencil style. Your diagrams look thought-through, not stamped out.' },
  { emoji: '👥', title: 'Draw together, live', text: 'Share a link and sketch on the same board in real time. See everyone’s cursor and coloured strokes as they happen.' },
  { emoji: '🧠', title: 'Smart connectors', text: 'Arrows bind to shapes. Drag a box across the canvas and its connections follow — perfect for mind-maps.' },
  { emoji: '🎯', title: 'Laser pointer', text: 'Switch to laser mode and a glowing trail follows your cursor. Made for explaining ideas on a call.' },
  { emoji: '🎨', title: 'Stickies & stickers', text: 'Crayon palette, handwriting sticky notes and a drawer of emoji stamps to make boards feel alive.' },
  { emoji: '🖼️', title: 'Export & share', text: 'Download a clean PNG of your work, or flip a board public and hand out a read-only link.' },
];

export default function Landing() {
  const { user } = useAuth();
  useReveal([]);
  const primaryTo = user ? '/app' : '/register';

  return (
    <div>
      <Navbar />

      {/* HERO */}
      <header className="hero container">
        <div className="eyebrow">Inkboard</div>
        <h1>
          Think out loud.<br />
          <span className="scribble">
            By hand.
            <svg viewBox="0 0 300 24" fill="none" preserveAspectRatio="none">
              <path d="M4 14 C 60 4, 120 22, 180 10 S 280 4, 296 14" stroke="var(--crayon-yellow)" strokeWidth="7" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="sub">
          A collaborative whiteboard that feels like a napkin sketch — but lives in the cloud,
          syncs in real time and never runs out of paper.
        </p>
        <div className="hero-cta">
          <Link to={primaryTo} className="btn btn-primary" style={{ fontSize: 17, padding: '14px 28px' }}>
            Start a board — free
          </Link>
          <a href="#features" className="btn btn-soft" style={{ fontSize: 17, padding: '14px 28px' }}>See what it does ↓</a>
        </div>

        <HeroMock />
      </header>

      {/* FEATURE STORY ROWS */}
      <section id="features" className="section">
        <div className="container">
          <FeatureRow
            title="Sketches that think with you"
            text="Rectangles, ellipses, diamonds, arrows and free-hand ink — all drawn with a gentle, hand-made roughness. It’s the clarity of a diagram with the warmth of a doodle."
            art={<MiniShapes />}
          />
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <FeatureRow
            reverse
            title="Everyone on the same page. Literally."
            text="Open a board with a teammate and watch their cursor glide across the canvas, their strokes appearing as they draw. Presence, live sync and a laser pointer for when you’re presenting."
            art={<MiniCollab />}
          />
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="section">
        <div className="container">
          <h2 className="reveal" style={{ fontSize: 'clamp(30px,4vw,46px)', textAlign: 'center', marginBottom: 12 }}>
            A full box of crayons
          </h2>
          <p className="reveal" style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: 19, marginBottom: 46 }}>
            Everything you need to get an idea out of your head.
          </p>
          <div className="grid7">
            {FEATURES.map((f) => (
              <div key={f.title} className="fcard reveal">
                <div className="emoji">{f.emoji}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT THE MAKER */}
      <section className="section alt" id="about">
        <div className="container">
          <div className="about-card reveal">
            <div className="about-avatar">RB</div>
            <div>
              <div className="eyebrow" style={{ fontSize: 18 }}>the human behind the crayons</div>
              <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', marginTop: 4 }}>Hi, I'm Rajan Bam 👋</h2>
              <p style={{ fontSize: 19, color: 'var(--ink-soft)', lineHeight: 1.55, marginTop: 12 }}>
                I'm a Computer Science student at <strong>LUT University</strong> in Lappeenranta,
                Finland. I finished my +2 in Science at <strong>Morgan International College</strong>,
                Kathmandu, and I love turning ideas into things people can actually click on.
                I built Inkboard for my Software Development Skills <em>Fullstack</em> module to
                learn the MERN stack end to end — and to make something I'd genuinely enjoy using.
              </p>
              <div className="about-tags">
                {['MongoDB', 'Express', 'React', 'Node.js', 'Socket.IO', 'Problem-solving'].map((t) => (
                  <span key={t} className="about-tag">{t}</span>
                ))}
              </div>
              <div style={{ marginTop: 18, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a className="btn btn-soft" href="mailto:bam049363@gmail.com">✉️ bam049363@gmail.com</a>
                <a className="btn btn-soft" href="https://github.com/RajanBam" target="_blank" rel="noreferrer">🐙 github.com/RajanBam</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band container">
        <h2 className="reveal">Grab a crayon.</h2>
        <p className="reveal">Your first board is a click away.</p>
        <Link to={primaryTo} className="btn btn-primary reveal" style={{ fontSize: 18, padding: '16px 34px' }}>
          Open Inkboard
        </Link>
      </section>

      <footer className="site-footer">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span className="marker" style={{ fontSize: 20 }}>🖍️ Inkboard</span>
          <span>Built by Rajan Bam · MERN stack coursework · {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureRow({ title, text, art, reverse }) {
  return (
    <div className={`feature-row reveal ${reverse ? 'reverse' : ''}`}>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="feature-art paper">{art}</div>
    </div>
  );
}

/* --- decorative animated SVGs (pure CSS, no libraries) --- */
function HeroMock() {
  return (
    <div className="board-mock reveal">
      <div className="bar">
        <span className="dot" style={{ background: '#ff5f57' }} />
        <span className="dot" style={{ background: '#febc2e' }} />
        <span className="dot" style={{ background: '#28c840' }} />
        <span className="marker" style={{ marginLeft: 10, color: 'var(--ink-soft)' }}>Product brainstorm</span>
      </div>
      <div className="stage paper">
        <svg viewBox="0 0 900 420" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <rect className="draw-path float" x="120" y="90" width="200" height="110" rx="8" fill="none" stroke="var(--crayon-blue)" strokeWidth="4" />
          <ellipse className="draw-path draw-2" cx="620" cy="150" rx="120" ry="72" fill="none" stroke="var(--crayon-green)" strokeWidth="4" />
          <path className="draw-path draw-3" d="M320 150 C 420 150, 470 150, 500 150" stroke="var(--crayon-red)" strokeWidth="4" fill="none" markerEnd="url(#ah)" />
          <path className="draw-path draw-4" d="M250 260 C 320 240, 420 300, 520 270 S 700 250, 760 300" stroke="var(--crayon-purple)" strokeWidth="4" fill="none" />
          <defs>
            <marker id="ah" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="none" stroke="var(--crayon-red)" strokeWidth="1.5" />
            </marker>
          </defs>
          <text x="150" y="155" fontFamily="Caveat, cursive" fontSize="34" fill="var(--ink)">Big idea</text>
          <text x="560" y="160" fontFamily="Caveat, cursive" fontSize="30" fill="var(--ink)">ship it 🚀</text>
        </svg>
        <div className="demo-cursor" style={{ position: 'absolute' }}>
          <svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 2 L3 17 L7.5 12.5 L10.5 19 L13 18 L10 11.5 L17 11 Z" fill="var(--crayon-red)" stroke="#fff" strokeWidth="1.2" /></svg>
          <span style={{ background: 'var(--crayon-red)', color: '#fff', fontSize: 11, padding: '1px 7px', borderRadius: 8 }}>Rajan</span>
        </div>
      </div>
    </div>
  );
}

function MiniShapes() {
  return (
    <svg viewBox="0 0 400 300" width="90%">
      <rect x="40" y="60" width="120" height="80" rx="6" fill="none" stroke="var(--crayon-blue)" strokeWidth="4" className="float" />
      <ellipse cx="290" cy="110" rx="70" ry="46" fill="none" stroke="var(--crayon-green)" strokeWidth="4" />
      <polygon points="200,200 250,240 200,280 150,240" fill="none" stroke="var(--crayon-purple)" strokeWidth="4" />
      <text x="60" y="110" fontFamily="Caveat, cursive" fontSize="30" fill="var(--ink)">boxes</text>
    </svg>
  );
}

function MiniCollab() {
  return (
    <svg viewBox="0 0 400 300" width="90%">
      <path d="M60 220 C 140 120, 260 120, 340 210" fill="none" stroke="var(--crayon-orange)" strokeWidth="4" strokeLinecap="round" />
      <g className="demo-cursor"><path d="M0 0 L0 15 L4 11 L7 17 L9 16 L6 10 L12 10 Z" fill="var(--crayon-blue)" stroke="#fff" strokeWidth="1" /></g>
      <circle cx="120" cy="150" r="8" fill="var(--crayon-red)" />
      <circle cx="300" cy="150" r="8" fill="var(--crayon-green)" />
      <text x="120" y="270" fontFamily="Caveat, cursive" fontSize="26" fill="var(--ink)">2 drawing…</text>
    </svg>
  );
}
