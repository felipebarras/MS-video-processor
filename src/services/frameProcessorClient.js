const axios = require('axios');
require('dotenv').config();

const FRAME_PROCESSOR_BASE_URL = process.env.PROCESSOR_URL || 'http://localhost:8080';

/**
 * Consulta o status de processamento dos vídeos de um cliente específico.
 * @param {string} clientName - Nome do cliente
 * @returns {Promise<Object>} - Lista dos frames processados
 */

async function getProcessingStatus(clientName) {
  try {
    const response = await axios.get(`${FRAME_PROCESSOR_BASE_URL}/status`, { params: { clientName } });

    return response.data;
  } catch (err) {
    console.error(`Erro ao consultar status de processamento: ${err}`);
    throw new Error('Erro ao consultar status de processamento dos vídeos.');
  }
}

module.exports = { getProcessingStatus };
