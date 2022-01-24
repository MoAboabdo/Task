const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Note = sequelize.define('note', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING,
  },
  message: {
    type: Sequelize.STRING,
  },
  mediaFiles: {
    type: Sequelize.STRING,
  },
});

module.exports = Note;
