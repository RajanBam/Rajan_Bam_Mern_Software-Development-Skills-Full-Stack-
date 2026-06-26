/*
 * Optional helper: creates a demo user and a couple of starter boards so a fresh
 * clone has something to look at. Run with `npm run seed` after MongoDB is up.
 *
 *   Demo login ->  email: demo@inkboard.app   password: password123
 */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Board = require('../models/Board');

async function run() {
  await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inkboard');

  await Board.deleteMany({});
  await User.deleteMany({ email: 'demo@inkboard.app' });

  const user = new User({ name: 'Demo Doodler', email: 'demo@inkboard.app', color: '#4d96ff' });
  await user.setPassword('password123');
  await user.save();

  await Board.create([
    {
      owner: user._id,
      title: 'Welcome to Inkboard',
      elements: [
        { id: 'w1', type: 'text', x: 140, y: 120, text: 'Hello!', color: '#1d1d1f', fontSize: 48, seed: 12 },
        { id: 'w2', type: 'rectangle', x: 120, y: 200, width: 260, height: 140, color: '#ff6b6b', seed: 7 },
        { id: 'w3', type: 'sticky', x: 440, y: 210, width: 180, height: 160, text: 'Drag me around :)', color: '#ffd93d', seed: 3 },
      ],
    },
    {
      owner: user._id,
      title: 'Project brainstorm',
      elements: [
        { id: 'b1', type: 'ellipse', x: 300, y: 160, width: 220, height: 120, color: '#6bcB77', seed: 21 },
        { id: 'b2', type: 'text', x: 360, y: 205, text: 'Ideas', color: '#1d1d1f', fontSize: 32, seed: 5 },
      ],
    },
  ]);

  console.log('Seeded demo user + boards. Login: demo@inkboard.app / password123');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
