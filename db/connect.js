const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

module.exports = new Sequelize(proces.env.DATABASE_URL);