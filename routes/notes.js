const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

const app = express();

const notesController = require('../controller/notes');

router.post('/send', upload, notesController.sendNote);

// keep this before all routes that will use pagination
app.use(paginate.middleware(10, 50));

router.get('/last_month', notesController.NotesLastMonth);

router.get('/:userId', notesController.getUsersNotes);

router.delete('/:userId/:noteId', notesController.DeleteNote);

module.exports = router;
