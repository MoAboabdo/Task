const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./utils/database');
const noteRouter = require('./routes/notes');

const User = require('./models/user');
const Note = require('./models/note');
const NoteType = require('./models/notetype');
const NotesController = require('./controller/notes');

const app = express();

app.use('api/notes', noteRouter);

const server = http.createServer(app);
const io = socketio(server);

const connectedUsers = [];
app.use(express.json({ extended: false }));
app.use(cors());
dotenv.config();

User.hasMany(Note);
Note.belongsTo(User);
NoteType.hasOne(Note);
Note.belongsTo(NoteType);

const PORT = process.env.PORT || 5000;

const ConnectDB = async () => {
  try {
    await sequelize.sync();

    console.log('Connection has been established');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

ConnectDB();
setInterval(() => {
  NotesController.getLastNotesStats();
}, 1000 * 60 * 60 * 24);

io.on('connection', socket => {
  console.log('user connected.....');

  socket.on('newUser', id =>
    connectedUsers.push({
      userId: id,
      socketId: socket.id,
    })
  );
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = { connectedUsers, io };
