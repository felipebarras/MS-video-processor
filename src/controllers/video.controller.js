const fs = require('fs');
const path = require('path');
const { extractFrames, createZipFromFolder } = require('../services/videoProcessor');
const awsClient = require('../utils/awsClient');
const frameProcessorClient = require('../services/frameProcessorClient');

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file || !req.body.email) return res.status(400).json({ error: 'Vídeo e e-mail são necessários.' });

    // TODO: adicionar o user aqui para enviar
    const { email } = req.body;
    // decodifica Base64 e salva o arquivo temporariamente
    const videoBuffer = req.file.buffer;
    const videoPath = path.join('uploads/videos/', `video_${Date.now()}.mp4`);

    fs.writeFileSync(videoPath, videoBuffer);
    console.log(`✅ vídeo salvo em: ${videoPath}`);

    // processamento dos frames
    const outputFolder = path.join('uploads/frames/', `${Date.now()}`);
    fs.mkdirSync(outputFolder, { recursive: true });

    // extração de frames de forma assíncrona
    extractFrames(videoPath, outputFolder, 20)
      .then(async () => {
        // cria um ZIP file com os frames extraídos
        // ao invés de enviar um arquivo zip, mandar os frames diretamente na fila junto das informações em sendMessageToQueue
        const zipFilePath = path.join('uploads/zips/', `frames_${Date.now()}.zip`);
        fs.mkdirSync(path.dirname(zipFilePath), { recursive: true });
        await createZipFromFolder(outputFolder, zipFilePath);

        // envia mensagem de processamento normal para a fila SQS
        await awsClient.sendMessageToQueue({
          type: 'PROCESS_VIDEO',
          videoId: videoPath,
          videoPath,
          outputFolder,
          zipFilePath,
          email
        });

        res.status(200).json({ message: 'Processamento iniciado com sucesso!' });
      })
      .catch(async (error) => {
        console.error(`❌ Erro durante o processamento do vídeo: ${error}`);
        // em caso de ERRO, envia a mensagem de erro para a fila SQS
        await awsClient.sendMessageToQueue({ type: 'error_message', email, message: error.message });

        res.status(500).json({ error: 'Erro durante o processamento do vídeo.' });
      });
  } catch (err) {
    console.error(`❌ Erro no endpoint de upload: ${err}`);
    res.status(500).json({ error: 'Erro no servidor.' });
  }
};

// consulta o status de processamento dos vídeos de um cliente
exports.getProcessingStatus = async (req, res) => {
  try {
    const { clientName } = req.query;
    if (!clientName) return res.status(400).json({ error: 'Nome do cliente é necessário.' });

    // chama o serviço de processamento de frames do Spring Booot
    const statusData = await frameProcessorClient.getProcessingStatus(clientName);

    res.status(200).json(statusData);
  } catch (err) {
    console.error(`Erro ao consultar status de processamento: ${err}`);
    res.status(500).json({ error: err.message });
  }
};
