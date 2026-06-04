// Coding along — the `events` module. This clicked once I realised Express,
// sockets and streams are all built on top of EventEmitter.
// Run: node 03-events.js

const EventEmitter = require('events');

class Oven extends EventEmitter {
  bake(item) {
    this.emit('start', item);
    setTimeout(() => this.emit('ready', item), 300);
  }
}

const oven = new Oven();

// register listeners
oven.on('start', (item) => console.log(`baking ${item}…`));
oven.on('ready', (item) => console.log(`${item} is ready! 🍞`));

// once() only fires a single time
oven.once('ready', () => console.log('(this only prints for the first bake)'));

oven.bake('bread');
oven.bake('cookies');
