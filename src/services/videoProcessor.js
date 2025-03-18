const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * Extrai frames de um vídeo em intervalos definidos.
 * @param {string} videoPath - Caminho do vídeo.
 * @param {string} outputFolder - Pasta onde os frames serão salvos.
 * @param {number} intervalSeconds - Intervalo para extração de frames (em segundos).
 */

function extractFrames(videoPath, outputFolder, intervalSeconds = 20) {
  return new Promise((resolve, reject) => {
    // garante que a pasta de saída existe
    if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });

    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration;
      console.log(`🕒 Duração do vídeo: ${duration} segundos.`);

      // gera timestamps para extração
      const timestamps = generateTimeStamps(duration, intervalSeconds);

      if (timestamps.length === 0) return reject(new Error('🚫 Nenhum timestamp gerado.'));

      ffmpeg(videoPath)
        .on('end', () => {
          console.log('✅ Extração de frames concluída.');
          resolve();
        })
        .on('error', (err) => {
          console.error(`❌ Erro na extração de frames: ${err}`);
          reject(err);
        })
        .output(path.join(outputFolder, 'frame_%04d.jpg')) // define padrão de saída
        .outputOptions([`-vf fps=1/${intervalSeconds}`]) // taxa de frames
        .run(); // inicia o processamento
    });
  });
}

/**
 * Gera timestamps em formato "HH:MM:SS.mmm" para extração.
 */
function generateTimeStamps(duration, interval) {
  const timestamps = [];

  if (duration < interval) {
    timestamps.push(1); //segundo 1
  } else {
    for (let time = interval; time <= duration; time += interval) {
      timestamps.push(time);
    }
  }

  return timestamps;
}

module.exports = { extractFrames };
