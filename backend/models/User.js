const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'An email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never send the hash to the client by default
    },
    // A little cartoon avatar colour picked at signup, used for the multiplayer cursor.
    color: {
      type: String,
      default: '#ff6b6b',
    },
  },
  { timestamps: true }
);

// Hash a plain password and store it. Called from the auth controller.
userSchema.methods.setPassword = async function setPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plain, salt);
};

userSchema.methods.checkPassword = function checkPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Shape sent back to the client (no hash, no __v).
userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    color: this.color,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
