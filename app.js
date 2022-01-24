const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./utils/database');

const User = require('./models/user');
const Note = require('./models/note');
const NoteType = require('./models/notetype');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

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

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
