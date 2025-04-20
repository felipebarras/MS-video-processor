const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const frameModel = require('../models/frame.model');
const s3 = require('../utils/s3.client');
const awsClient = require('../utils/awsClient');
const { COGNITO_CLIENT_ID } = require('../utils/env');

jest.mock('../models/frame.model');
jest.mock('../utils/s3.client');
jest.mock('../utils/awsClient');
jest.mock('jsonwebtoken');

describe('Frame Routes com authenticate', () => {
  const mockAuthHeader = { Authorization: `Bearer mock.jwt.token` };
  const mockFrame = {
    _id: '661d6c7edaa3e3f4e4a3b879',
    username: 'felipebarras',
    email: 'felipe@email.com',
    videoName: 'video-felipe.mp4',
    status: 'pending',
    createdAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();

    jwt.verify.mockImplementation((token, getKey, options, callback) => {
      callback(null, { client_id: COGNITO_CLIENT_ID || 'mock-client_id' });
    });
  });

  test('POST /frames - deve criar um novo frame', async () => {
    frameModel.createFrame.mockResolvedValue(mockFrame._id);

    const response = await request(app)
      .post('/frames')
      .set(mockAuthHeader)
      .send({ username: mockFrame.username, email: mockFrame.email, videoName: mockFrame.videoName });

    expect(response.status).toBe(201);
    expect(response.body.frameId).toBe(mockFrame._id);
  });

  test('GET /frames - deve frames por username', async () => {
    frameModel.getFrameByUsername.mockResolvedValue([mockFrame]);

    const response = await request(app).get('/frames').query({ username: 'felipebarras' }).set(mockAuthHeader);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test('GET /frames/:frameId - deve retornar um frame por ID', async () => {
    frameModel.getFrameById.mockResolvedValue(mockFrame);

    const response = await request(app).get(`/frames/${mockFrame._id}`).set(mockAuthHeader);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(mockFrame.username);
  });

  test('GET /frames/:frameId/upload - deve retornar um presigned link', async () => {
    s3.generatePresignedUrl.mockResolvedValue('https://mock-upload-url.com');

    const response = await request(app).get(`/frames/${mockFrame._id}/upload`).set(mockAuthHeader);

    expect(response.status).toBe(200);
    expect(response.body.uploadURL).toBe('https://mock-upload-url.com');
  });

  test('PATCH /frames/:frameId/uploaded - deve confirmar o upload e enviar para a fila', async () => {
    frameModel.getFrameById.mockResolvedValue(mockFrame);
    frameModel.updateFrameStatus.mockResolvedValue({});
    awsClient.sendMessageToQueue.mockResolvedValue({});
    s3.generatePresignedUrl.mockResolvedValue('https://mock-download-url.com');

    const response = await request(app)
      .patch(`/frames/${mockFrame._id}/uploaded`)
      .set(mockAuthHeader)
      .send({ username: mockFrame.username, email: mockFrame.email });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('Upload confirmado');
  });

  test('DELETE /frames - deve apagar todos os frames', async () => {
    frameModel.deleteAllFrames.mockResolvedValue({});

    const response = await request(app).delete('/frames').set(mockAuthHeader);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Todos os frames foram deletados.');
  });
});
