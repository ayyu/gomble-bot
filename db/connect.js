const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const assignExists = (obj, prop, val) => {
	if (val != null) obj[prop] = val;
}

const dbOpts = {};
assignExists(dbOpts, 'host', process.env.DB_HOST);
assignExists(dbOpts, 'port', process.env.DB_PORT);
assignExists(dbOpts, 'dialect', process.env.DB_DIALECT);
assignExists(dbOpts, 'storage', process.env.DB_STORAGE);
dbOpts['logging'] = false;

module.exports = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASS,
	dbOpts
);