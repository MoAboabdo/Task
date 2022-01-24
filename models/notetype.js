const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const NoteType = sequelize.define(
  'noteType',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    disable: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
  },
  {
    tableName: 'NoteTypes',
  }
);

module.exports = NoteType;
