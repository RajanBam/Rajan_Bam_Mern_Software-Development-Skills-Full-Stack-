// Coding along — an HTTP server built from scratch with NO Express, just the
// core `http` module. Doing this first made it obvious what Express does for you
// later (routing, parsing, res.json, etc.).
//
// Run:  node 04-http-server.js   then open http://localhost:3000
const http = require('http');

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // A tiny hand-rolled router.
  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Hello from raw Node 👋</h1><p>No Express here.</p>');
    return;
  }

  if (method === 'GET' && url === '/api/time') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ now: new Date().toISOString() }));
    return;
  }

  if (method === 'POST' && url === '/api/echo') {
    // Body arrives in chunks — you have to collect them yourself.
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ youSent: body }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Raw Node server on http://localhost:${PORT}`));
