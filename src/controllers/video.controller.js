const fs = require('fs');
const path = require('path');
const { extractFrames } = require('../services/videoProcessor');
const awsClient = require('../utils/awsClient');
const frameProcessorClient = require('../services/frameProcessorClient');

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file || !req.body.email || !req.body.username) return res.status(400).json({ error: 'Vídeo, e-mail e username são necessários.' });

    const { email, username } = req.body;
    // decodifica Base64 e salva o arquivo temporariamente
    const videoBuffer = req.file.buffer;
    const videoPath = path.join('uploads/videos/', `video_${Date.now()}.mp4`);

    // cria a pasta de vídeos
    fs.mkdirSync(path.dirname(videoPath), { recursive: true });

    // Salva vídeo na pasta
    fs.writeFileSync(videoPath, videoBuffer);
    console.log(`✅ vídeo salvo em: ${videoPath}`);

    // processamento dos frames
    const framesFolder = path.join('uploads/frames/', `${Date.now()}`);
    fs.mkdirSync(framesFolder, { recursive: true });

    // extração de frames de forma assíncrona
    extractFrames(videoPath, framesFolder, 20)
      .then(async () => {
        console.log('✅ Frames extraídos, aguardando processamento...');

        // aguardando para ver se garante o salvamento dos arquivos
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // converte os frames para Base64
        const framesBase64 = fs
          .readdirSync(framesFolder)
          .filter((file) => file.match(/\.(jpg|jpeg|png)/))
          .map((file) => {
            const framePath = path.join(framesFolder, file);
            const frameBuffer = fs.readFileSync(framePath);

            return {
              filename: file,
              data: frameBuffer.toString('base64')
            };
          });

        if (framesBase64.length === 0) {
          console.error('❌ Nenhum frame encontrado.');
          return res.status(500).json({ error: 'Erro ao extrair frames do vídeo.' });
        }

        console.log(`📸 ${framesBase64.length} frames extraídos, enviando para a fila SQS...`);

        // envia mensagem de processamento normal para a fila SQS
        await awsClient.sendMessageToQueue({
          type: 'PROCESS_VIDEO',
          videoId: videoPath,
          frames: framesBase64,
          email,
          username
        });

        res.status(200).json({ message: 'Processamento iniciado com sucesso!' });
      })
      .catch(async (error) => {
        console.error(`❌ Erro durante o processamento do vídeo: ${error}`);

        await awsClient.sendMessageToQueue({ type: 'error_message', email, username, message: error.message });

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
