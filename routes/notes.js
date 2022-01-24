const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

const notesController = require('../controller/notes');

module.exports = router;
