// Coding along — the `fs` module (reading & writing files).
// I used the promises API because callbacks got nested too deep.
// Run: node 02-fs.js

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const dir = path.join(__dirname, 'scratch');
const file = path.join(dir, 'todo.txt');

async function main() {
  // make a folder (recursive: true means "don't error if it already exists")
  await fsp.mkdir(dir, { recursive: true });

  // write, then append
  await fsp.writeFile(file, 'learn Node\n');
  await fsp.appendFile(file, 'learn Express\n');
  await fsp.appendFile(file, 'build Inkboard\n');

  // read it back
  const text = await fsp.readFile(file, 'utf-8');
  console.log('--- todo.txt ---');
  console.log(text);

  // list the folder
  console.log('files in scratch:', await fsp.readdir(dir));

  // clean up so the repo stays tidy
  await fsp.rm(dir, { recursive: true, force: true });
  console.log('cleaned up.');
}

main().catch((err) => console.error('Something went wrong:', err));

// The old callback style, for comparison — this is what the promises API replaces.
fs.stat(__filename, (err, stats) => {
  if (err) return console.error(err);
  console.log('this file is', stats.size, 'bytes');
});
