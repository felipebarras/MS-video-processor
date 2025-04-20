const { ObjectId } = require('mongodb');
const frameModel = require('../models/frame.model');
const { connectToDatabase, getDb } = require('../config/database');

let client, db;

beforeAll(async () => {
  await connectToDatabase();
  db = getDb();
});

afterAll(async () => {
  await db.collection('frames').deleteMany({});
});

describe('Frame Model', () => {
  let insertedId;

  test('createFrame - deve inserir um novo frame e retornar o ID', async () => {
    const data = { username: 'felipebarras', email: 'felipe@email.com', videoName: 'felipe-video.mp4', status: 'pending', createdAt: new Date() };
    insertedId = await frameModel.createFrame(data);

    expect(insertedId).toBeInstanceOf(ObjectId);
  });

  test('getFrameById - deve retornar um frame baseado em seu ID', async () => {
    const frame = await frameModel.getFrameById(insertedId);

    expect(frame).toBeDefined();
    expect(frame.username).toBe('felipebarras');
  });

  test('getFrameByUsername deve retornar lista de frames por username', async () => {
    const frames = await frameModel.getFrameByUsername('felipebarras');

    expect(Array.isArray(frames)).toBe(true);
    expect(frames.length).toBeGreaterThan(0);
  });

  test('updateFrameStatus deve atualizar o status do frame', async () => {
    await frameModel.updateFrameStatus(insertedId, 'UPLOAD_FEITO');
    const updated = await frameModel.getFrameById(insertedId);

    expect(updated.status).toBe('UPLOAD_FEITO');
  });

  test('deleteAllFrames deve apagar tudo da base de dados', async () => {
    await frameModel.deleteAllFrames();
    const frames = await frameModel.getFrameByUsername('felipebarras');

    expect(frames.length).toBe(0);
  });
});
