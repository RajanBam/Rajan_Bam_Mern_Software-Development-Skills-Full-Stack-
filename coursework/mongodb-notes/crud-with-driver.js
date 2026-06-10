// Coding along — the same CRUD from the cheatsheet, but from Node using the
// native `mongodb` driver (Mongoose sits on top of this).
//
// Needs a local MongoDB running as a service, plus:  npm install mongodb
// Run:  node crud-with-driver.js
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log('connected');

  const db = client.db('inkboard_practice');
  const boards = db.collection('boards');
  await boards.deleteMany({}); // start clean each run

  // CREATE
  const { insertedId } = await boards.insertOne({ title: 'Practice', tags: ['mern'], views: 0, createdAt: new Date() });
  await boards.insertMany([{ title: 'A', tags: ['react'] }, { title: 'B', tags: ['node'] }]);

  // READ
  console.log('count :', await boards.countDocuments());
  console.log('byTag :', await boards.find({ tags: 'react' }).toArray());

  // UPDATE
  await boards.updateOne({ _id: insertedId }, { $set: { title: 'Practice (edited)' }, $inc: { views: 1 } });
  console.log('after update:', await boards.findOne({ _id: new ObjectId(insertedId) }));

  // DELETE
  const { deletedCount } = await boards.deleteMany({ tags: 'node' });
  console.log('deleted:', deletedCount);

  await client.close();
}

main().catch((err) => {
  console.error('Could not run — is MongoDB running as a service?', err.message);
  process.exit(1);
});
