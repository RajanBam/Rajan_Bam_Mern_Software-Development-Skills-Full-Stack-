const Board = require('../models/Board');

// GET /api/boards  -> boards owned by the logged-in user (newest first)
async function listBoards(req, res, next) {
  try {
    const boards = await Board.find({ owner: req.user._id }).sort({ updatedAt: -1 });
    res.json(boards.map((b) => b.toCard()));
  } catch (err) {
    next(err);
  }
}

// POST /api/boards  -> create a fresh board
async function createBoard(req, res, next) {
  try {
    const board = await Board.create({
      owner: req.user._id,
      title: req.body.title || 'Untitled board',
      elements: [],
    });
    res.status(201).json(board.toCard());
  } catch (err) {
    next(err);
  }
}

// GET /api/boards/:id  -> full board (must be the owner)
async function getBoard(req, res, next) {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      res.status(404);
      throw new Error('Board not found');
    }
    if (String(board.owner) !== String(req.user._id)) {
      res.status(403);
      throw new Error('This board belongs to someone else');
    }
    res.json(board);
  } catch (err) {
    next(err);
  }
}

// PUT /api/boards/:id  -> save the scene (title / elements / appState / thumbnail)
async function updateBoard(req, res, next) {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      res.status(404);
      throw new Error('Board not found');
    }
    if (String(board.owner) !== String(req.user._id)) {
      res.status(403);
      throw new Error('This board belongs to someone else');
    }

    const { title, elements, appState, thumbnail, isPublic } = req.body;
    if (title !== undefined) board.title = title;
    if (Array.isArray(elements)) board.elements = elements;
    if (appState !== undefined) board.appState = appState;
    if (typeof thumbnail === 'string') board.thumbnail = thumbnail;
    if (typeof isPublic === 'boolean') board.isPublic = isPublic;

    await board.save();
    res.json(board.toCard());
  } catch (err) {
    next(err);
  }
}

// DELETE /api/boards/:id
async function deleteBoard(req, res, next) {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      res.status(404);
      throw new Error('Board not found');
    }
    if (String(board.owner) !== String(req.user._id)) {
      res.status(403);
      throw new Error('This board belongs to someone else');
    }
    await board.deleteOne();
    res.json({ message: 'Board deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
}

// GET /api/boards/shared/:shareId  -> public, read-only view (no auth needed)
async function getSharedBoard(req, res, next) {
  try {
    const board = await Board.findOne({ shareId: req.params.shareId });
    if (!board || !board.isPublic) {
      res.status(404);
      throw new Error('This board is private or does not exist');
    }
    res.json({
      id: board._id,
      title: board.title,
      elements: board.elements,
      appState: board.appState,
      readOnly: true,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listBoards,
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
  getSharedBoard,
};
