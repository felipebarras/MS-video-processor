const frameModel = require('../models/frame.model');
const { sendMessageToQueue } = require('../utils/awsClient');
const presignedUrl = require('../utils/s3.client');

exports.createFrame = async (req, res) => {
  try {
    const { username, email, videoName } = req.body;
    console.log(`📬 Requisição recebida: username=${username}, email=${email}, videoName=${videoName}`);

    const data = { username, email, videoName, status: 'pending', createdAt: new Date() };
    const frameId = await frameModel.createFrame(data);

    console.log(`✅ Frame criado com ID: ${frameId}`);
    res.status(201).location(`/frames/${frameId}`).json({ frameId });
  } catch (err) {
    console.error(`Erro ao criar o frame: ${err}`);
    res.status(400).json({ error: 'Erro ao criar o frame' });
  }
};

exports.getFrameById = async (req, res) => {
  try {
    const { frameId } = req.params;

    const frame = await frameModel.getFrameById(frameId);
    if (!frame) return res.status(404).json({ error: 'Frame não encontrado.' });

    console.log(`Frame encontrado por ID: ${JSON.stringify(frame)}`);

    res.status(200).json(frame);
  } catch (err) {
    console.error(`Erro ao consultar frame por ID: ${err}`);
    res.status(500).json({ error: 'Erro ao consultar frame por ID.' });
  }
};

exports.getFrameByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'O parâmetro username é obrigatório' });

    const frames = await frameModel.getFrameByUsername(username);
    res.status(200).json(frames);
  } catch (err) {
    console.error(`Erro ao listar os frames: ${err}`);
    res.status(500).json({ error: 'Erro ao listar os frames.' });
  }
};

exports.getUploadURL = async (req, res) => {
  try {
    const { frameId } = req.params;
    const url = await presignedUrl.generatePresignedUrl(frameId, 'putObject');

    console.log(`Gerando presigned link de upload para o frameId=${frameId} url=${url}`);

    res.status(200).json({ uploadURL: url });
  } catch (err) {
    console.error(`Erro ao conseguir a URL de upload: ${err}`);
    res.status(500).json({ error: 'Erro ao conseguir a URL de upload.' });
  }
};

exports.confirmUpload = async (req, res) => {
  try {
    const { frameId } = req.params;
    const { username, email } = req.body;

    const frame = await frameModel.getFrameById(frameId);
    if (!frame) {
      console.log(`Confirm Upload: Frame não encontrado. ${frameId}`);
      return res.status(404).json({ error: 'Frame não encontrado.' });
    }
    console.log(`Frame encontrado do upload: frameId=${frameId}`);

    const downloadURL = await presignedUrl.generatePresignedUrl(frameId, 'getObject');

    await sendMessageToQueue({
      type: 'PROCESS_VIDEO',
      frameId,
      status: 'upload_feito',
      videoDownloadURL: downloadURL,
      username,
      email
    });

    await frameModel.updateFrameStatus(frameId, 'upload_feito');

    res.status(200).json({ message: 'Upload confirmado e notificação enviada para SQS!' });
  } catch (err) {
    console.error(`Erro ao confirmar o upload: ${err}`);
    res.status(500).json({ error: 'Erro ao confirmar o upload de vídeo.' });
  }
};

exports.deleteAllFrames = async (req, res) => {
  try {
    await frameModel.deleteAllFrames();

    console.log(`🧹 Todos os frames foram deletados`);
    res.status(200).json({ message: 'Todos os frames foram deletados.' });
  } catch (err) {
    console.error(`Erro ao deletar frames: ${err}`);
    res.status(500).json({ error: 'Erro ao deletar os frames.' });
  }
};

