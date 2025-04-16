const express = require('express');
const router = express.Router();
const frameController = require('../controllers/frame.controller');

router.post('/', frameController.createFrame);
router.get('/', frameController.getFrameByUsername);
router.get('/:frameId', frameController.getFrameById);
router.get('/:frameId/upload', frameController.getUploadURL);
router.patch('/:frameId/uploaded', frameController.confirmUpload);
router.delete('/', frameController.deleteAllFrames);

module.exports = router;
