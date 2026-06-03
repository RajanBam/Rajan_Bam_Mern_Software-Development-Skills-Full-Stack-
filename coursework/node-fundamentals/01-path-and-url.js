// Coding along with the Node.js crash course — the `path` and `url` modules.
// Run: node 01-path-and-url.js

const path = require('path');
const url = require('url');

// __filename / __dirname are the full path to this file and its folder.
console.log('file :', __filename);
console.log('dir  :', __dirname);

// path helpers save you from gluing strings with the wrong slashes.
console.log('basename :', path.basename(__filename)); // 01-path-and-url.js
console.log('extname  :', path.extname(__filename));  // .js
console.log('join     :', path.join(__dirname, 'data', 'notes.txt'));
console.log('parse    :', path.parse(__filename));

// The WHATWG URL API — the modern way to pull a request URL apart.
const myUrl = new URL('https://example.com:8000/search?q=mern&page=2#top');
console.log('host     :', myUrl.host);        // example.com:8000
console.log('pathname :', myUrl.pathname);    // /search
console.log('query q  :', myUrl.searchParams.get('q')); // mern
console.log('legacy   :', url.parse('https://example.com/a/b').pathname);
