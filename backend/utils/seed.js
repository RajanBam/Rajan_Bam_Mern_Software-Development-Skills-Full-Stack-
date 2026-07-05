/*
 * Seed script: drops in a demo account with a whole gallery of ready-made boards
 * so a fresh clone (or a recorded demo) has something rich to show. Every element
 * type is represented — shapes, bound arrows, sticky notes, text, freehand ink and
 * emoji stickers — across 12 realistic boards (mind maps, flowcharts, kanban,
 * system design, wireframes and more).
 *
 * Run with MongoDB up:  npm run seed
 *   Demo login ->  email: demo@inkboard.app   password: password123
 */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Board = require('../models/Board');

// ---- tiny element builders so the boards below stay readable ----
let n = 0;
const id = () => `seed_${(n += 1).toString(36)}`;
const seed = () => Math.floor(Math.random() * 1e9);

const rect = (x, y, w, h, color = '#4d96ff', strokeWidth = 4) => ({ id: id(), type: 'rectangle', x, y, width: w, height: h, color, strokeWidth, seed: seed() });
const ellipse = (x, y, w, h, color = '#6bcb77', strokeWidth = 4) => ({ id: id(), type: 'ellipse', x, y, width: w, height: h, color, strokeWidth, seed: seed() });
const diamond = (x, y, w, h, color = '#ff924c', strokeWidth = 4) => ({ id: id(), type: 'diamond', x, y, width: w, height: h, color, strokeWidth, seed: seed() });
const text = (x, y, str, fontSize = 30, color = '#1d1d1f') => ({ id: id(), type: 'text', x, y, text: str, fontSize, color, seed: seed() });
const sticky = (x, y, str, color = '#ffd93d') => ({ id: id(), type: 'sticky', x, y, width: 170, height: 160, text: str, color, seed: seed() });
const sticker = (x, y, emoji, size = 60) => ({ id: id(), type: 'sticker', x, y, emoji, size });
const ink = (points, color = '#c58bf2', strokeWidth = 5) => ({ id: id(), type: 'draw', points, color, strokeWidth, seed: seed() });
const arrow = (a, b, color = '#1d1d1f', bindA = null, bindB = null) => ({
  id: id(), type: 'arrow', x1: a.x, y1: a.y, x2: b.x, y2: b.y, color, strokeWidth: 3, seed: seed(),
  startBinding: bindA, endBinding: bindB,
});
const center = (el) => ({ x: el.x + el.width / 2, y: el.y + el.height / 2 });

// Connect two box-like elements with an arrow that stays bound to them.
const link = (from, to, color = '#1d1d1f') => arrow(center(from), center(to), color, from.id, to.id);

// ---------- the boards ----------
function bWelcome() {
  const box = rect(120, 210, 240, 120, '#ff6b6b');
  const note = sticky(430, 190, 'Double-click me to edit ✏️', '#ffd93d');
  return {
    title: 'Welcome to Inkboard',
    elements: [
      text(150, 130, 'Hello there! 👋', 52),
      box, text(150, 285, 'a hand-drawn box', 26),
      note,
      ellipse(680, 200, 200, 120, '#4d96ff'),
      text(720, 270, 'and an ellipse', 24, '#1d1d1f'),
      arrow({ x: 360, y: 270 }, { x: 430, y: 260 }, '#6bcb77'),
      sticker(560, 380, '🎨'), sticker(300, 400, '🚀'),
    ],
  };
}

function bArchitecture() {
  const react = rect(90, 120, 200, 90, '#4d96ff');
  const express = rect(90, 300, 200, 90, '#6bcb77');
  const mongo = rect(90, 480, 200, 90, '#ff924c');
  const socket = rect(470, 210, 200, 90, '#c58bf2');
  return {
    title: 'System design — Inkboard architecture',
    elements: [
      text(120, 80, 'How the MERN pieces fit', 34),
      react, text(120, 175, 'React (Vite)', 26, '#fff'),
      express, text(115, 355, 'Express API', 26, '#fff'),
      mongo, text(120, 535, 'MongoDB', 26, '#fff'),
      socket, text(500, 265, 'Socket.IO', 26, '#fff'),
      link(react, express, '#4d96ff'),
      link(express, mongo, '#6bcb77'),
      link(react, socket, '#c58bf2'),
      link(socket, express, '#c58bf2'),
      sticky(470, 400, 'realtime broadcast + DB debounce', '#7bed9f'),
    ],
  };
}

function bRoadmap() {
  const core = ellipse(380, 260, 200, 110, '#ff6b6b');
  const a = rect(80, 90, 180, 80, '#4d96ff');
  const b = rect(660, 90, 180, 80, '#6bcb77');
  const c = rect(80, 430, 180, 80, '#ff924c');
  const d = rect(660, 430, 180, 80, '#c58bf2');
  return {
    title: 'Product roadmap (mind map)',
    elements: [
      core, text(430, 320, 'Inkboard', 34, '#fff'),
      a, text(100, 140, 'Auth & accounts', 22, '#fff'),
      b, text(690, 140, 'Realtime sync', 22, '#fff'),
      c, text(110, 480, 'Exporting', 22, '#fff'),
      d, text(690, 480, 'Templates', 22, '#fff'),
      link(core, a, '#4d96ff'), link(core, b, '#6bcb77'),
      link(core, c, '#ff924c'), link(core, d, '#c58bf2'),
      sticker(300, 130, '💡'), sticker(600, 470, '⭐'),
    ],
  };
}

function bRetro() {
  const cols = [
    { x: 60, t: 'Went well 🙂', c: '#7bed9f', notes: ['Realtime worked!', 'Clean commits', 'Nice UI'] },
    { x: 340, t: 'To improve 🤔', c: '#ffd93d', notes: ['Mobile layout', 'More tests'] },
    { x: 620, t: 'Actions ✅', c: '#74b9ff', notes: ['Add templates', 'Record demo'] },
  ];
  const els = [text(60, 60, 'Sprint retrospective', 34)];
  cols.forEach((col) => {
    els.push(text(col.x + 10, 110, col.t, 26));
    col.notes.forEach((note, i) => els.push(sticky(col.x, 130 + i * 150, note, col.c)));
  });
  return { title: 'Sprint retro board', elements: els };
}

function bFlow() {
  const start = ellipse(360, 60, 160, 80, '#6bcb77');
  const input = rect(360, 200, 160, 80, '#4d96ff');
  const decision = diamond(340, 340, 200, 140, '#ff924c');
  const yes = rect(120, 540, 160, 80, '#6bcb77');
  const no = rect(600, 540, 160, 80, '#ff6b6b');
  return {
    title: 'User flow — logging in',
    elements: [
      start, text(390, 110, 'Start', 26, '#fff'),
      input, text(375, 250, 'Enter email', 22, '#fff'),
      decision, text(390, 415, 'Valid?', 26, '#fff'),
      yes, text(150, 590, 'Dashboard', 22, '#fff'),
      no, text(630, 590, 'Show error', 22, '#fff'),
      arrow(center(start), center(input), '#1d1d1f', start.id, input.id),
      arrow(center(input), center(decision), '#1d1d1f', input.id, decision.id),
      arrow(center(decision), center(yes), '#6bcb77', decision.id, yes.id),
      arrow(center(decision), center(no), '#ff6b6b', decision.id, no.id),
      text(210, 510, 'yes', 22, '#6bcb77'), text(540, 510, 'no', 22, '#ff6b6b'),
    ],
  };
}

function bKanban() {
  const cols = [
    { x: 60, t: 'To do', cards: ['Wireframes', 'Pick colours', 'Write README'] },
    { x: 340, t: 'Doing', cards: ['Canvas engine', 'Realtime cursors'] },
    { x: 620, t: 'Done', cards: ['Auth', 'Boards API', 'Landing page'] },
  ];
  const els = [text(60, 55, 'Kanban board', 34)];
  cols.forEach((col) => {
    els.push(rect(col.x - 10, 100, 190, 520, '#d2d2d7', 2));
    els.push(text(col.x + 10, 135, col.t, 26));
    col.cards.forEach((card, i) => els.push(sticky(col.x, 160 + i * 150, card, '#ffffff')));
  });
  return { title: 'Kanban — build tasks', elements: els };
}

function bWireframe() {
  return {
    title: 'Wireframe — landing page',
    elements: [
      rect(120, 70, 760, 70, '#1d1d1f', 3), text(140, 115, 'navbar / logo ........ links', 22),
      rect(120, 170, 760, 220, '#4d96ff', 3), text(400, 290, 'HERO — big headline', 26),
      rect(120, 420, 240, 160, '#6bcb77', 3), text(150, 505, 'feature 1', 22),
      rect(380, 420, 240, 160, '#ff924c', 3), text(410, 505, 'feature 2', 22),
      rect(640, 420, 240, 160, '#c58bf2', 3), text(670, 505, 'feature 3', 22),
      sticker(820, 90, '📐'),
    ],
  };
}

function bMindMap() {
  const core = ellipse(370, 250, 220, 120, '#c58bf2');
  const nodes = [
    ['MongoDB', 80, 80, '#ff924c'], ['Express', 700, 80, '#6bcb77'],
    ['React', 80, 430, '#4d96ff'], ['Node.js', 700, 430, '#6bcb77'],
  ].map(([t, x, y, c]) => ({ el: rect(x, y, 170, 80, c), t }));
  const els = [core, text(410, 315, 'MERN', 40, '#fff'), text(120, 60, 'What I learned', 30)];
  nodes.forEach(({ el, t }) => { els.push(el, text(el.x + 20, el.y + 48, t, 24, '#fff'), link(core, el, el.color)); });
  return { title: 'Mind map — the MERN stack', elements: els };
}

function bStudyPlan() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const tasks = ['Node basics', 'MongoDB CRUD', 'Express API', 'React hooks', 'Build project'];
  const colors = ['#ffd93d', '#7bed9f', '#74b9ff', '#ff9ff3', '#ffa07a'];
  const els = [text(60, 55, 'Weekly study plan 📚', 34)];
  days.forEach((day, i) => {
    els.push(text(80 + i * 165, 110, day, 24));
    els.push(sticky(60 + i * 165, 130, tasks[i], colors[i]));
  });
  return { title: 'Weekly study plan', elements: els };
}

function bBrainstorm() {
  const core = ellipse(380, 250, 200, 110, '#ff6b6b');
  const ideas = ['Templates', 'Voice notes', 'Timers', 'Dark mode', 'Emoji reactions', 'Laser mode'];
  const els = [core, text(430, 310, 'Ideas 💡', 30, '#fff')];
  ideas.forEach((idea, i) => {
    const ang = (i / ideas.length) * Math.PI * 2;
    const x = 460 + Math.cos(ang) * 320;
    const y = 300 + Math.sin(ang) * 220;
    const node = sticky(x, y, idea, ['#ffd93d', '#7bed9f', '#74b9ff', '#ff9ff3'][i % 4]);
    els.push(node, arrow(center(core), center(node), '#c58bf2', core.id, node.id));
  });
  return { title: 'Brainstorm — feature ideas', elements: els };
}

function bMeetingNotes() {
  return {
    title: 'Meeting notes — kickoff',
    elements: [
      text(80, 70, 'Project kickoff', 40),
      text(80, 140, '• Goal: learn MERN by building', 26),
      text(80, 190, '• Deadline: 5 July 2026', 26),
      text(80, 240, '• Must have: realtime + auth', 26),
      text(80, 290, '• Nice to have: templates', 26),
      ink([[80, 320], [430, 320], [430, 322], [80, 322]], '#ffd93d', 8),
      sticky(560, 130, 'remember to record the demo!', '#ff9ff3'),
      sticker(470, 60, '📝'), sticker(760, 300, '⏰'),
    ],
  };
}

function bDoodle() {
  const wave = [];
  for (let i = 0; i <= 40; i += 1) wave.push([120 + i * 18, 300 + Math.sin(i / 3) * 60]);
  const loop = [];
  for (let i = 0; i <= 50; i += 1) { const a = (i / 50) * Math.PI * 2; loop.push([620 + Math.cos(a) * 90, 250 + Math.sin(a * 2) * 70]); }
  return {
    title: 'Doodle playground ✏️',
    elements: [
      text(120, 120, 'just having fun', 40, '#c58bf2'),
      ink(wave, '#4d96ff', 6),
      ink(loop, '#ff6b6b', 5),
      sticker(300, 420, '🌈', 80), sticker(520, 430, '☁️', 70), sticker(700, 430, '🔥', 70),
    ],
  };
}

async function run() {
  await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inkboard');

  await Board.deleteMany({});
  await User.deleteMany({ email: 'demo@inkboard.app' });

  const user = new User({ name: 'Demo Doodler', email: 'demo@inkboard.app', color: '#4d96ff' });
  await user.setPassword('password123');
  await user.save();

  const boards = [
    bWelcome(), bArchitecture(), bRoadmap(), bRetro(), bFlow(), bKanban(),
    bWireframe(), bMindMap(), bStudyPlan(), bBrainstorm(), bMeetingNotes(), bDoodle(),
  ];

  await Board.create(boards.map((b) => ({ ...b, owner: user._id })));

  console.log(`Seeded ${boards.length} boards for demo@inkboard.app / password123`);
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
