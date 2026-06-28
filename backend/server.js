require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const createApp = require('./app');
const connectDB = require('./config/db');
const registerCollab = require('./realtime/collab');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inkboard';

async function start() {
  await connectDB(MONGODB_URI);

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_ORIGIN || '*', methods: ['GET', 'POST'] },
  });
  registerCollab(io);

  server.listen(PORT, () => {
    console.log(`Inkboard server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
