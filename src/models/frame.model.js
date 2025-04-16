const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');

exports.createFrame = async (data) => {
  const db = await getDb();
  const result = await db.collection('frames').insertOne(data);

  return result.insertedId;
};

exports.getFrameById = async (id) => {
  const db = await getDb();

  return db.collection('frames').findOne({ _id: new ObjectId(id) });
};

exports.getFrameByUsername = async (username) => {
  const db = await getDb();

  return db.collection('frames').find({ username }).toArray();
};

exports.updateFrameStatus = async (id, newStatus) => {
  const db = await getDb();

  return db.collection('frames').updateOne({ _id: new ObjectId(id) }, { $set: { status: newStatus } });
};

exports.deleteAllFrames = async () => {
  const db = getDb();

  return db.collection('frames').deleteMany({});
};
