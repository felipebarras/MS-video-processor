const frameModel = require('../models/frame.model');
const frameController = require('../controllers/frame.controller');
const s3 = require('../utils/s3.client');
const awsClient = require('../utils/awsClient');

jest.mock('../models/frame.model');
jest.mock('../utils/s3.client');
jest.mock('../utils/awsClient');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.location = jest.fn().mockReturnValue(res);

  return res;
};

describe('Frame Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('createFrame - deve criar um novo frame', async () => {
    const req = {
      body: { username: 'felipebarras', email: 'felipe@email.com', videoName: 'video-felipe.mp4' }
    };
    const res = mockRes();

    frameModel.createFrame.mockResolvedValue('abc123');

    await frameController.createFrame(req, res);

    expect(frameModel.createFrame).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ frameId: 'abc123' });
  });

  test('getFrameById - deve retornar um frame baseado no ID', async () => {
    const req = { params: { frameId: 'abc123' } };
    const res = mockRes();

    frameModel.getFrameById.mockResolvedValue({ _id: 'abc123', username: 'felipebarras' });

    await frameController.getFrameById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: 'abc123', username: 'felipebarras' });
  });

  test('getUploadURL - deve retornar URL de upload', async () => {
    const req = { params: { frameId: 'abc123' } };
    const res = mockRes();

    s3.generatePresignedUrl.mockResolvedValue('https://test-presigned.url');

    await frameController.getUploadURL(req, res);

    expect(s3.generatePresignedUrl).toHaveBeenCalledWith('abc123', 'putObject');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ uploadURL: 'https://test-presigned.url' });
  });

  test('confirmUpload - deve enviar para fila SQS e atualizar status', async () => {
    const req = {
      params: { frameId: 'abc123' },
      body: { username: 'felipebarras', email: 'felipe@email.com' }
    };
    const res = mockRes();

    frameModel.getFrameById.mockResolvedValue({ _id: 'abc123' });
    frameModel.updateFrameStatus.mockResolvedValue({});
    awsClient.sendMessageToQueue.mockResolvedValue({});

    await frameController.confirmUpload(req, res);

    expect(frameModel.getFrameById).toHaveBeenCalledWith('abc123');
    expect(frameModel.updateFrameStatus).toHaveBeenCalledWith('abc123', 'upload_feito');
    expect(awsClient.sendMessageToQueue).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deleteAllFrames - deve apagar todos os frames do banco de dados', async () => {
    const req = {};
    const res = mockRes();

    frameModel.deleteAllFrames.mockResolvedValue({});

    await frameController.deleteAllFrames(req, res);

    expect(frameModel.deleteAllFrames).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
