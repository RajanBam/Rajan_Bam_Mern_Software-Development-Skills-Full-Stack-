const mongoose = require('mongoose');

// Small wrapper around mongoose.connect so server.js stays tidy.
async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

module.exports = connectDB;
