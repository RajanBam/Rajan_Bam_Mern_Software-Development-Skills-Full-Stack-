const User = require('../models/User');
const { signToken } = require('../utils/token');

// A friendly palette so every collaborator gets a distinct cursor colour.
const CURSOR_COLORS = ['#ff6b6b', '#4d96ff', '#ffd93d', '#6bcB77', '#c58bf2', '#ff924c', '#00c2a8'];

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email and password are all required');
    }
    if (String(password).length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    const user = new User({
      name,
      email,
      color: CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)],
    });
    await user.setPassword(password);
    await user.save();

    res.status(201).json({ token: signToken(user._id), user: user.toPublic() });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide an email and password');
    }
    // passwordHash has select:false, so ask for it explicitly.
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+passwordHash');
    if (!user || !(await user.checkPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }
    res.json({ token: signToken(user._id), user: user.toPublic() });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: req.user.toPublic() });
}

module.exports = { register, login, me };
