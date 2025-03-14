const express = require('express');
const multer = require('multer');
const videoController = require('../controllers/video.controller');
const router = express.Router();

// upload de arquivos com Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rota de upload de vídeo
router.post('/upload', upload.single('video'), videoController.uploadVideo);

// Rota para consultar status de processamento
router.get('/status', videoController.getProcessingStatus);

module.exports = router;
