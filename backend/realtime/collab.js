const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Board = require('../models/Board');

/*
 * Realtime whiteboard collaboration over Socket.IO.
 *
 * Each board is a "room" (room name = `board:<id>`). When someone opens a board
 * they join the room; drawing changes and cursor moves are broadcast to everyone
 * else in that room. The scene is persisted to MongoDB on a debounce so we are
 * not writing to the database on every single pointer move.
 *
 * Events in  : join-board, leave-board, elements-change, cursor-move, laser
 * Events out : presence, elements-change, cursor-move, cursor-leave, laser
 */
function registerCollab(io) {
  // boardId -> Map(socketId -> { id, name, color })
  const rooms = new Map();
  // boardId -> timeout handle for the debounced save
  const saveTimers = new Map();

  // Authenticate the socket from the token sent in the handshake.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('No auth token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.data.user = { id: String(user._id), name: user.name, color: user.color };
      next();
    } catch (err) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;

    socket.on('join-board', async (boardId) => {
      // Only allow joining boards the user actually owns.
      const board = await Board.findById(boardId).select('owner');
      if (!board || String(board.owner) !== user.id) {
        socket.emit('error-message', 'You cannot join this board');
        return;
      }
      const room = `board:${boardId}`;
      socket.join(room);
      socket.data.boardId = boardId;

      if (!rooms.has(boardId)) rooms.set(boardId, new Map());
      rooms.get(boardId).set(socket.id, user);

      // Tell everyone who is currently in the room.
      io.to(room).emit('presence', Array.from(rooms.get(boardId).values()));
    });

    // A batch of changed/added/removed elements from one client.
    socket.on('elements-change', (elements) => {
      const boardId = socket.data.boardId;
      if (!boardId) return;
      socket.to(`board:${boardId}`).emit('elements-change', elements);
      scheduleSave(boardId, elements);
    });

    socket.on('cursor-move', (point) => {
      const boardId = socket.data.boardId;
      if (!boardId) return;
      socket.to(`board:${boardId}`).emit('cursor-move', {
        socketId: socket.id,
        name: user.name,
        color: user.color,
        ...point,
      });
    });

    // Ephemeral laser-pointer trail while presenting.
    socket.on('laser', (points) => {
      const boardId = socket.data.boardId;
      if (!boardId) return;
      socket.to(`board:${boardId}`).emit('laser', {
        socketId: socket.id,
        color: user.color,
        points,
      });
    });

    socket.on('leave-board', () => cleanup(socket));
    socket.on('disconnect', () => cleanup(socket));

    function cleanup(sock) {
      const boardId = sock.data.boardId;
      if (!boardId) return;
      const room = `board:${boardId}`;
      const members = rooms.get(boardId);
      if (members) {
        members.delete(sock.id);
        if (members.size === 0) rooms.delete(boardId);
        else io.to(room).emit('presence', Array.from(members.values()));
      }
      sock.to(room).emit('cursor-leave', sock.id);
      sock.leave(room);
      sock.data.boardId = null;
    }
  });

  // Persist the latest scene at most once per second per board.
  function scheduleSave(boardId, elements) {
    if (saveTimers.has(boardId)) clearTimeout(saveTimers.get(boardId));
    saveTimers.set(
      boardId,
      setTimeout(async () => {
        saveTimers.delete(boardId);
        try {
          await Board.findByIdAndUpdate(boardId, { elements });
        } catch (err) {
          console.error('Failed to persist board', boardId, err.message);
        }
      }, 1000)
    );
  }
}

module.exports = registerCollab;
