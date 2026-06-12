// A router (express.Router) — the video's way of keeping routes out of server.js.
const express = require('express');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

// In-memory "database" so the example runs with no setup.
let tasks = [
  { id: 1, title: 'Watch Node crash course', done: true },
  { id: 2, title: 'Build the Express mini-app', done: false },
];
let nextId = 3;

// Reusable middleware that turns validation errors into a 400 response.
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
  }
  next();
}

// GET /api/tasks  — list all
router.get('/', (req, res) => res.json(tasks));

// GET /api/tasks/:id — one, with a param validator
router.get('/:id', param('id').isInt().withMessage('id must be a number'), handleValidation, (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST /api/tasks — create, validating the body
router.post(
  '/',
  body('title').trim().notEmpty().withMessage('title is required')
    .isLength({ max: 100 }).withMessage('title too long'),
  handleValidation,
  (req, res) => {
    const task = { id: nextId++, title: req.body.title, done: false };
    tasks.push(task);
    res.status(201).json(task);
  }
);

// PUT /api/tasks/:id — toggle done
router.put('/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.done = Boolean(req.body.done);
  res.json(task);
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  tasks = tasks.filter((t) => t.id !== Number(req.params.id));
  res.json({ deleted: Number(req.params.id) });
});

module.exports = router;
