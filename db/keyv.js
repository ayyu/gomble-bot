const Keyv = require('keyv');
const dotenv = require('dotenv');
const KeyvPostgres = require('@keyv/postgres');

dotenv.config();

const store = new KeyvPostgres({
	uri: process.env.DATABASE_URL,
	ssl: {
		require: true,
		rejectUnauthorized: false,
	},
});

/** @type {Keyv<Array<Object>>} */
const permsKV = new Keyv({ store, namespace: 'perms' });
/** @type {Keyv<String|Number>} */
const wagesKV = new Keyv({ store, namespace: 'wages' });
/** @type {Keyv<Number>} */
const pricesKV = new Keyv({ store, namespace: 'prices' });
/** @type {Keyv<any>} */
const configKV = new Keyv({ store, namespace: 'config' });

module.exports = {
	permsKV,
	wagesKV,
	pricesKV,
	configKV,
};
