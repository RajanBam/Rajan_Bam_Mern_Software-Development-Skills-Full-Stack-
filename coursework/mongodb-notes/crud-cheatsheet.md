# MongoDB CRUD — my notes from the crash course

I installed MongoDB **as a service** (as the module note says) and used `mongosh`
plus MongoDB Compass to poke around. These are the commands I kept coming back to.

## Databases & collections
```js
show dbs
use inkboard          // switch to (and lazily create) a database
show collections
db.boards.drop()      // delete a collection
```

## Create
```js
db.boards.insertOne({ title: "First board", elements: [], createdAt: new Date() })
db.boards.insertMany([
  { title: "A", tags: ["mern"] },
  { title: "B", tags: ["react", "node"] }
])
```

## Read
```js
db.boards.find()                       // everything
db.boards.find({ title: "A" })         // filter (equality)
db.boards.findOne({ _id: ObjectId("...") })
db.boards.find({ tags: "react" })      // match an item inside an array
db.boards.find({ "elements.0": { $exists: true } })  // boards that have >=1 element

// operators
db.boards.find({ createdAt: { $gt: ISODate("2026-06-01") } })   // $gt/$lt/$gte/$lte
db.boards.find({ tags: { $in: ["react", "vue"] } })
db.boards.find({ $or: [{ title: "A" }, { title: "B" }] })

// shape / sort / paginate
db.boards.find({}, { title: 1, _id: 0 })        // projection
db.boards.find().sort({ createdAt: -1 }).limit(10).skip(0)
db.boards.countDocuments({ tags: "mern" })
```

## Update
```js
db.boards.updateOne({ title: "A" }, { $set: { title: "A (renamed)" } })
db.boards.updateMany({}, { $set: { archived: false } })
db.boards.updateOne({ title: "A" }, { $push: { tags: "new" } })   // array push
db.boards.updateOne({ title: "A" }, { $inc: { views: 1 } })       // increment
db.boards.updateOne({ title: "Z" }, { $set: { title: "Z" } }, { upsert: true })
```

## Delete
```js
db.boards.deleteOne({ title: "A (renamed)" })
db.boards.deleteMany({ archived: true })
```

## Indexes (why my queries got faster)
```js
db.boards.createIndex({ owner: 1 })          // single field
db.boards.createIndex({ shareId: 1 }, { unique: true })
db.boards.getIndexes()
```

## How this maps to the project
In the backend I don't type these by hand — **Mongoose** wraps them. But it helped
a lot to know that `Board.find({ owner })` becomes `db.boards.find({ owner })`, and
that `unique: true` in the schema is the same `createIndex(..., { unique: true })`.
