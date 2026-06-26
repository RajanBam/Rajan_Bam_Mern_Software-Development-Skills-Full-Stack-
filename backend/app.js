const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const { notFound, errorHandler } = require('./middleware/error');

// Express app is kept separate from the HTTP/Socket server so it is easy to test.
function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
  // Scenes can get chunky (freehand paths, thumbnails) so allow a generous body.
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'inkboard-server', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/boards', boardRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
