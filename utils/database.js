const Sequelize = require('sequelize');

const sequelize = new Sequelize('pentavaluetask', 'root', '0Xdevmo**//987', {
  dialect: 'mysql',
  host: 'localhost',
});

module.exports = sequelize;
