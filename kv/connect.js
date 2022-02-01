const Keyv = require('keyv');
const { database } = require('../config.json')

const dialect = database.options.dialect;
const uri = (dialect == 'sqlite')
	? `${dialect}://${database.options.storage}`
	: `${dialect}://${database.username}:${database.password}@${database.options.host}:${database.options.port}`;

module.exports = {
	currency: new Keyv(uri, {namespace: 'currency'}),
};