# Inkboard: a collaborative hand-drawn whiteboard

**Author:** Rajan Bam (002295635)
**Course:** Software Development Skills — Fullstack module (MERN stack)
**Institution:** LUT University, Lappeenranta, Finland

Inkboard is a real-time collaborative whiteboard in which every shape, arrow and
note is rendered in a hand-drawn style. Boards are stored in the cloud and
synchronise live between everyone who has them open.

The project is a complete MERN application — MongoDB, Express, React and Node.js —
with Socket.IO providing the real-time collaboration layer. It was built for the
Fullstack module to demonstrate an end-to-end understanding of the stack.

## Features

| Feature | Description |
| --- | --- |
| Hand-drawn tools | Rectangles, ellipses, diamonds, arrows, lines and a freehand pen, rendered with a sketched look (rough.js and perfect-freehand). |
| Real-time collaboration | Multiple users can edit the same board simultaneously and see each other's cursors and strokes as they happen (Socket.IO rooms). |
| Bound connectors | Arrows bind to shapes and follow them when the shapes are moved, which is useful for mind maps and diagrams. |
| Presentation tools | A laser-pointer mode with a fading trail and a distraction-free presentation view. |
| Notes and stickers | Handwriting sticky notes, an emoji sticker set and a colour palette. |
| Export and sharing | Export a board as PNG or SVG, or publish a read-only link. |
| Light and dark themes | A theme toggle that persists across visits. |

The application also provides email/password authentication (JWT), a boards
dashboard with thumbnails, an infinite pan-and-zoom canvas, undo/redo, grid and
snap-to-grid, duplication, z-ordering and keyboard shortcuts.

## Technology

- **Frontend:** React 18 with Vite, React Router, the HTML5 Canvas, `roughjs`,
  `perfect-freehand` and `socket.io-client`.
- **Backend:** Node.js, Express, Mongoose, JSON Web Tokens (`jsonwebtoken`),
  `bcryptjs` and `socket.io`.
- **Database:** MongoDB, either installed locally as a service or hosted on
  MongoDB Atlas.

## Repository structure

```
.
├── backend/          Express API and Socket.IO real-time server
├── frontend/         React (Vite) single-page application
├── coursework/       Exercises coded along with the module videos
├── LEARNING_DIARY.md Day-by-day learning diary for the module
├── VIDEO.md          Link to the demo video
└── README.md
```

## Running the project locally

### Prerequisites

- Node.js 18 or newer, and npm.
- MongoDB. On the course this is installed as a service, so it starts
  automatically on `mongodb://127.0.0.1:27017`. A MongoDB Atlas cluster may be
  used instead by placing its `mongodb+srv://…` string in `MONGODB_URI`. If the
  Atlas password contains reserved characters, URL-encode them (for example, `!`
  becomes `%21`).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # edit .env if required (see below)
npm run seed                # optional: demo account and 12 sample boards
npm run dev                 # starts on http://localhost:5000
```

Environment variables (`.env`):

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

Open http://localhost:5173. The Vite development server proxies `/api` and
`/socket.io` to the backend on port 5000, so no further configuration is needed.

### Demo account (after running `npm run seed`)

```
email:    demo@inkboard.app
password: password123
```

### Testing collaboration

Open the same board in two browser windows (for example, one normal and one
private window, each signed in) and draw. Cursors and strokes synchronise
between the two in real time.

## Demo video

A screen recording of the application is linked in [VIDEO.md](./VIDEO.md).

## Learning diary

The day-by-day learning diary for the module is in
[LEARNING_DIARY.md](./LEARNING_DIARY.md).

## Coursework

The `coursework/` directory contains the exercises completed alongside each
module video (Node.js fundamentals, MongoDB CRUD, an Express mini-API and React
snippets). Each subdirectory has its own README. See
[coursework/README.md](./coursework/README.md).

## Notes on the architecture

- A board's drawing is stored as a single `elements` array on the board document
  rather than as one record per shape, so loading a board is a single read and
  the canvas renderer simply iterates over the array.
- Real-time changes are broadcast to everyone in a board's Socket.IO room and
  persisted to MongoDB on a short debounce, avoiding a database write on every
  pointer movement.
- Arrows store the identifiers of the shapes they connect, and their endpoints
  are resolved at render time, which allows connectors to follow shapes as they
  move.
