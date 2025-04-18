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

  test('createFrame - deve retornar um erro 400 se falhar ao criar um frame', async () => {
    const req = {
      body: { username: 'felipebarras', email: 'felipe@email.com', videoName: 'video-felipe.mp4' }
    };
    const res = mockRes();

    frameModel.createFrame.mockRejectedValue(new Error('Erro no banco'));

    await frameController.createFrame(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao criar o frame' });
  });

  test('getFrameById - deve retornar um 200 e o frame baseado no ID', async () => {
    const req = { params: { frameId: 'abc123' } };
    const res = mockRes();

    frameModel.getFrameById.mockResolvedValue({ _id: 'abc123', username: 'felipebarras', email: 'felipe@email.com' });

    await frameController.getFrameById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: 'abc123', username: 'felipebarras', email: 'felipe@email.com' });
  });

  test('getFrameById - deve retornar um erro 404 se o frame não for encontrado', async () => {
    const req = { params: { frameId: 'abc123' } };
    const res = mockRes();

    frameModel.getFrameById.mockResolvedValue(null); // preciso forçar a p&@#* do null

    await frameController.getFrameById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Frame não encontrado.' });
  });

  test('getFrameById - deve retornar um erro 500 se falhar ao consultar', async () => {
    const req = { params: { frameId: 'abc123' } };
    const res = mockRes();

    frameModel.getFrameById.mockRejectedValue(new Error('Erro ao consultar frame por ID.'));

    await frameController.getFrameById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao consultar frame por ID.' });
  });

  test('getFrameByUsername - deve retornar um 200 e o frame baseado pelo username', async () => {
    const req = { query: { username: 'felipebarras' } };
    const res = mockRes();

    frameModel.getFrameByUsername.mockResolvedValue({ _id: 'abc123', username: 'felipebarras', email: 'felipe@email.com' });

    await frameController.getFrameByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: 'abc123', username: 'felipebarras', email: 'felipe@email.com' });
  });

  test('getFrameByUsername - deve retornar um 400 se o username não for digitado', async () => {
    const req = { query: { username: '' } };
    const res = mockRes();

    await frameController.getFrameByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'O parâmetro username é obrigatório' });
  });

  test('getFrameByUsername - deve retornar um 500 se falhar ao consultar', async () => {
    const req = { query: { username: 'felipebarras' } };
    const res = mockRes();

    frameModel.getFrameByUsername.mockRejectedValue(new Error('Erro ao listar os frames.'));

    await frameController.getFrameByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar os frames.' });
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

  test('getUploadURL - deve retornar 500 se falhar na geração do URL de upload', async () => {
    const req = { params: { frameId: 'abc123' } };
    const res = mockRes();

    s3.generatePresignedUrl.mockRejectedValue('Erro ao conseguir a URL de upload.');

    await frameController.getUploadURL(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao conseguir a URL de upload.' });
  });

  test('confirmUpload - deve enviar para fila SQS e atualizar status', async () => {
    const req = {
      params: { frameId: 'abc123' },
      body: { username: 'felipebarras', email: 'felipe@email.com' }
    };
    const res = mockRes();

    frameModel.getFrameById.mockResolvedValue({ _id: 'abc123' });
    s3.generatePresignedUrl.mockResolvedValue('https://test-upload-url');
    awsClient.sendMessageToQueue.mockResolvedValue({});
    frameModel.updateFrameStatus.mockResolvedValue({});

    await frameController.confirmUpload(req, res);

    expect(frameModel.getFrameById).toHaveBeenCalledWith('abc123');
    expect(frameModel.updateFrameStatus).toHaveBeenCalledWith('abc123', 'upload_feito');
    expect(awsClient.sendMessageToQueue).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Upload confirmado e notificação enviada para SQS!' });
  });

  test('confirmUpload - deve retornar 404 se o frame não for encontrado', async () => {
    const req = {
      params: { frameId: 'abc123' },
      body: { username: 'felipebarras', email: 'felipe@email.com' }
    };
    const res = mockRes();

    frameModel.getFrameById.mockResolvedValue(null); // preciso forçar a p&@#* do null

    await frameController.confirmUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Frame não encontrado.' });
  });

  test('confirmUpload - deve retornar 500 se algo falhar', async () => {
    const req = {
      params: { frameId: 'abc123' },
      body: { username: 'felipebarras', email: 'felipe@email.com' }
    };
    const res = mockRes();

    frameModel.getFrameById.mockResolvedValue({ _id: 'abc123' });
    s3.generatePresignedUrl.mockRejectedValue(new Error('erro'));

    await frameController.confirmUpload(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao confirmar o upload de vídeo.' });
  });

  test('deleteAllFrames - deve apagar todos os frames do banco de dados', async () => {
    const req = {};
    const res = mockRes();

    frameModel.deleteAllFrames.mockResolvedValue({});

    await frameController.deleteAllFrames(req, res);

    expect(frameModel.deleteAllFrames).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Todos os frames foram deletados.' });
  });

  test('deleteAllFrames - deve retornar um 500 se algo falhar ao apagar o banco de dados', async () => {
    const req = {};
    const res = mockRes();

    frameModel.deleteAllFrames.mockRejectedValue(new Error('Erro ao deletar os frames.'));

    await frameController.deleteAllFrames(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao deletar os frames.' });
  });
});
