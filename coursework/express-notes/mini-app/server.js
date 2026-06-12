// Coding along with the Express crash course: a small tasks API that shows the
// four things the video covers — routing, middleware, request bodies and
// validation. Data is kept in memory so it runs without a database.
//
// Run:  npm install  then  npm start   (listens on http://localhost:4000)
const express = require('express');
const tasksRouter = require('./routes/tasks');

const app = express();

// --- built-in middleware: parse JSON request bodies ---
app.use(express.json());

// --- custom middleware: a tiny request logger ---
// This is the "middleware runs in order and calls next()" idea from the video.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);
  next();
});

/*
 * NOTE ON VALIDATION
 * The module page suggests:  app.use(expressValidator());
 * That global middleware was from express-validator v5 and was REMOVED in v6+.
 * The modern way (v7, used here) is to import `body` / `validationResult` and
 * attach checks per-route — see routes/tasks.js. I kept this note because working
 * that difference out was part of what I learned.
 */

app.get('/', (req, res) => res.json({ ok: true, try: 'GET /api/tasks' }));
app.use('/api/tasks', tasksRouter);

// --- error-handling middleware (4 args) ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Express mini-app on http://localhost:${PORT}`));
}

module.exports = app; // exported so it could be tested
