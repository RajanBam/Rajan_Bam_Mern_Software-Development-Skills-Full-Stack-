# Node.js fundamentals (coding along)

From the Node.js crash course. Each file is runnable on its own with `node <file>`
— no dependencies, just the standard library.

| File | Module | Notes |
| --- | --- | --- |
| `01-path-and-url.js` | `path`, `url` | building/parsing file paths and URLs safely |
| `02-fs.js` | `fs` / `fs/promises` | read, write, append, list, delete files |
| `03-events.js` | `events` | `EventEmitter`, `.on()`, `.once()`, `.emit()` |
| `04-http-server.js` | `http` | a web server + JSON API with no framework |

## What stuck with me
- Everything async in Node is either a callback, a promise or an event. The
  `fs/promises` API + `async/await` is so much easier to read than nested callbacks.
- `EventEmitter` is the pattern underneath Express and Socket.IO — `req.on('data')`
  in `04-http-server.js` is the same idea I later used on the server.
- Writing the HTTP server by hand made me appreciate what Express gives you:
  routing, body parsing and `res.json()` are all things I had to do manually here.
