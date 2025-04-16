const { MongoClient } = require('mongodb');
const { MONGODB_URI } = require('../utils/env');

let db;

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);

  await client.connect();
  db = client.db();
  console.log(`✅ Conectado ao MongoDB`);
}

function getDb() {
  if (!db) throw new Error('❌ Banco de dados não conectado!');
  return db;
}

module.exports = { connectToDatabase, getDb };
