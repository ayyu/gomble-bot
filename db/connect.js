const { Sequelize } = require('sequelize');
const { database } = require('../config.json')

module.exports = new Sequelize(
	database.name,
	database.username,
	database.password,
	database.options
);