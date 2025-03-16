const express = require('express');
const multer = require('multer');
const videoController = require('../controllers/video.controller');
const healthCheckController = require('../controllers/health.check')
const router = express.Router();

// upload de arquivos com Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rota de health check
router.get('/health', healthCheckController.healthCheck);

// Rota de upload de vídeo
router.post('/upload', upload.single('video'), videoController.uploadVideo);

// Rota para consultar status de processamento
router.get('/status', videoController.getProcessingStatus);

module.exports = router;
