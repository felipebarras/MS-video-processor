const express = require('express');
const authenticate = require('../config/authMiddleware')
const router = express.Router();
const frameController = require('../controllers/frame.controller');

router.post('/', authenticate, frameController.createFrame);
router.get('/', authenticate, frameController.getFrameByUsername);
router.get('/:frameId', authenticate, frameController.getFrameById);
router.get('/:frameId/upload', authenticate, frameController.getUploadURL);
router.patch('/:frameId/uploaded', authenticate, frameController.confirmUpload);
router.delete('/', authenticate, frameController.deleteAllFrames);

module.exports = router;
