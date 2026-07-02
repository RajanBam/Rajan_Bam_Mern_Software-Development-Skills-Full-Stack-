// Shared vocabulary for the whiteboard: tools, palette, stickers.

export const TOOLS = {
  SELECT: 'select',
  HAND: 'hand',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  DIAMOND: 'diamond',
  ARROW: 'arrow',
  LINE: 'line',
  DRAW: 'draw',
  TEXT: 'text',
  STICKY: 'sticky',
  STICKER: 'sticker',
  LASER: 'laser',
  ERASER: 'eraser',
};

// Which tools create a shape by click-drag (as opposed to select/hand/laser).
export const SHAPE_TOOLS = new Set([
  TOOLS.RECTANGLE,
  TOOLS.ELLIPSE,
  TOOLS.DIAMOND,
  TOOLS.ARROW,
  TOOLS.LINE,
]);

export const CRAYON_COLORS = [
  '#1d1d1f', // ink
  '#ff6b6b', // red
  '#4d96ff', // blue
  '#ffd93d', // yellow
  '#6bcb77', // green
  '#c58bf2', // purple
  '#ff924c', // orange
];

export const STICKY_COLORS = ['#ffd93d', '#ff9ff3', '#7bed9f', '#74b9ff', '#ffa07a'];

export const STICKERS = ['⭐', '❤️', '💡', '🔥', '✅', '❓', '🎯', '🚀', '☁️', '🌈', '👍', '🤔'];

export const STROKE_WIDTHS = [2, 4, 7];

// Fixed handle size in screen pixels regardless of zoom.
export const HANDLE = 8;
