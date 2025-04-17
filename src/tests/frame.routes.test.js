const request = require('supertest');
const app = require('../app');
const frameModel = require('../models/frame.model');

jest.mock('../models/frame.model');

describe('Frame Routes', () => {
  const mockFrame = {
    _id: '661d6c7edaa3e3f4e4a3b879',
    username: 'felipebarras',
    email: 'felipe@email.com',
    videoName: 'video-felipe.mp4',
    status: 'pending',
    createdAt: new Date()
  };

  beforeEach(() => jest.clearAllMocks());

  test('POST /frames - deve criar um novo frame', async () => {
    frameModel.createFrame.mockResolvedValue(mockFrame._id);

    const response = await request(app)
      .post('/frames')
      .send({ username: mockFrame.username, email: mockFrame.email, videoName: mockFrame.videoName });

    expect(response.status).toBe(201);
    expect(response.body.frameId).toBe(mockFrame._id);
  });

  test('GET /frames/:frameId - deve retornar um frame por ID', async () => {
    frameModel.getFrameByUsername.mockResolvedValue([mockFrame]);

    const response = await request(app).get('/frames').query({ username: 'felipebarras' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test('DELETE /frames - deve apagar todos os frames', async () => {
    frameModel.deleteAllFrames.mockResolvedValue({ deletedcount: 1 });

    const response = await request(app).delete('/frames');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Todos os frames foram deletados.');
  });
});
