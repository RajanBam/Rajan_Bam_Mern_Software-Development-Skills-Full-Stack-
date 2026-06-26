const express = require('express');
const {
  listBoards,
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
  getSharedBoard,
} = require('../controllers/boardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public read-only share link first so it is not shadowed by "/:id".
router.get('/shared/:shareId', getSharedBoard);

// Everything below needs a logged-in user.
router.use(protect);
router.route('/').get(listBoards).post(createBoard);
router.route('/:id').get(getBoard).put(updateBoard).delete(deleteBoard);

module.exports = router;
