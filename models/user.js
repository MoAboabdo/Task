const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const User = sequelize.define(
  'user',
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
    picture: {
      type: Sequelize.STRING,
    },
  },
  {
    tableName: 'users',
  }
);

module.exports = User;
