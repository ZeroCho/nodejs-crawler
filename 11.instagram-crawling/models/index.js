const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.Proxy = require('./proxy')(sequelize, Sequelize);
db.Facebook = require('./facebook')(sequelize, Sequelize);
db.Instagram = require('./instagram')(sequelize, Sequelize);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
