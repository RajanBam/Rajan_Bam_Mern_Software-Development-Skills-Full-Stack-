# 🖍️ Inkboard — a hand-drawn collaborative whiteboard

**Author:** Rajan Bam
**Course:** Software Development Skills — *Fullstack* module (MERN stack)
**Institution:** LUT University, Lappeenranta, Finland

Inkboard is a real-time collaborative whiteboard where every shape, arrow and
doodle is rendered in a warm, hand-drawn style. Think of a shared napkin sketch
that lives in the cloud, syncs live between people, and never runs out of paper.

It is a full **MERN** application — **M**ongoDB, **E**xpress, **R**eact,
**N**ode.js — plus Socket.IO for the real-time collaboration.

> The clean, Apple-inspired landing/marketing page wraps a deliberately playful,
> crayon-and-handwriting product. Two moods, one app.

---

## ✨ Features

| | Feature | What it does |
| --- | --- | --- |
| ✍️ | **Hand-drawn tools** | Rectangles, ellipses, diamonds, arrows, lines and a smooth freehand pen — all rendered with a wobbly, sketched look (rough.js + perfect-freehand). |
| 👥 | **Real-time collaboration** | Share a board and draw together live — you see other people's cursors, names and strokes appear instantly (Socket.IO rooms). |
| 🧠 | **Smart bound arrows** | Connect two shapes and the arrow stays glued to them when you drag them around — great for mind-maps. |
| 🎯 | **Laser pointer** | A glowing, fading trail for presenting your board on a call. |
| 🎨 | **Stickies, stickers & crayons** | Handwriting sticky notes, an emoji sticker drawer and a crayon colour palette. |
| 🖼️ | **Export & share** | Download a clean PNG, or flip a board public and hand out a read-only link. |
| 🌗 | **Light / dark theme** | Apple-style theme toggle with smooth transitions, remembered across visits. |

Plus: email/password accounts (JWT), a boards dashboard with thumbnails,
infinite pan & zoom, undo/redo, and keyboard shortcuts.

---

## 🧱 Tech stack

- **Frontend:** React 18 + Vite, React Router, HTML5 Canvas, `roughjs`,
  `perfect-freehand`, `socket.io-client`
- **Backend:** Node.js, Express, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`,
  `socket.io`
- **Database:** MongoDB (installed locally as a service, or MongoDB Atlas)

```
.
├── backend/        Express API + Socket.IO realtime server
├── frontend/       React (Vite) single-page app
├── coursework/     video-along exercises (Node, MongoDB, Express, React)
├── LEARNING_DIARY.md
├── VIDEO.md        link to the demo video
└── README.md
```

---

## 🚀 Running it locally

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** running locally. On the course this is installed **as a service**
  (see the module's setup note), so it starts automatically on
  `mongodb://127.0.0.1:27017`. A free **MongoDB Atlas** cluster works too — put its
  `mongodb+srv://…` string in `MONGODB_URI` (step 1). If your Atlas password has
  special characters, URL-encode them — e.g. `!` becomes `%21`.

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env        # then edit .env if needed (see below)
npm run seed                # optional: demo account + 12 ready-made sample boards
npm run dev                 # starts on http://localhost:5000
```

`.env` values:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/inkboard
JWT_SECRET=any-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` and
`/socket.io` to the backend on port 5000, so there is nothing else to configure.

### Demo login (after `npm run seed`)
```
email:    demo@inkboard.app
password: password123
```

### Try the collaboration
Open the same board in two browser windows (e.g. one normal, one incognito, each
signed in), and draw — you'll see the cursors and strokes sync live.

---

## 🎬 Demo video

A screen recording of the app running is linked in **[VIDEO.md](./VIDEO.md)**.

---

## 📓 Learning diary

My day-by-day learning diary for the module is in
**[LEARNING_DIARY.md](./LEARNING_DIARY.md)**.

---

## 📚 Coursework

The `coursework/` folder holds the small exercises I coded along with each video
(Node fundamentals, MongoDB CRUD, an Express mini-API, React snippets). Each has
its own README. See **[coursework/README.md](./coursework/README.md)**.

---

## 🧭 A note on the architecture

- The whole drawing is stored as one `elements` array on the `Board` document,
  rather than a row per shape. Loading a board is then a single read, and the
  canvas renderer just walks the array.
- Realtime changes are **broadcast** to everyone in a board's Socket.IO room and
  **persisted** to MongoDB on a short debounce, so we don't hit the database on
  every pointer move.
- Arrows remember which shapes they're bound to and their endpoints are resolved
  at render time, which is what lets connections follow shapes as they move.
