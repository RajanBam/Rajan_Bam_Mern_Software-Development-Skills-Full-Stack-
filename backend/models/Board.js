const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

/*
 * A board stores the whole "scene" of the whiteboard.
 * Rather than modelling every shape as its own collection (which would make
 * loading a board a big join), the drawing lives as an array of plain element
 * objects. Each element is validated on the client and is shaped like:
 *   { id, type, x, y, width, height, points, text, color, ... }
 * Mixed lets us keep that flexible without a migration every time the canvas
 * learns a new tool.
 */
const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Untitled board',
      trim: true,
      maxlength: 120,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    elements: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    // Non-drawing state we still want to remember (background colour, last zoom).
    appState: {
      type: mongoose.Schema.Types.Mixed,
      default: { background: '#fbfbfd' },
    },
    // A small data-URL preview rendered on the client so the dashboard can show cards.
    thumbnail: {
      type: String,
      default: '',
    },
    // Anyone with the link can view (read-only) when this is on.
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareId: {
      type: String,
      unique: true,
      default: () => nanoid(10),
      index: true,
    },
  },
  { timestamps: true }
);

boardSchema.methods.toCard = function toCard() {
  return {
    id: this._id,
    title: this.title,
    thumbnail: this.thumbnail,
    isPublic: this.isPublic,
    shareId: this.shareId,
    elementCount: Array.isArray(this.elements) ? this.elements.length : 0,
    updatedAt: this.updatedAt,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Board', boardSchema);
