const Keyv = require('keyv');
const dotenv = require('dotenv');
const KeyvPostgres = require('@keyv/postgres');

dotenv.config();

const store = new KeyvPostgres({
	uri: process.env.DATABASE_URL,
	ssl: {
		require: true,
		rejectUnauthorized: false,
	}
});

module.exports = {
	permsKV: new Keyv({store, namespace: 'perms'}),
	wagesKV: new Keyv({store, namespace: 'wages'}),
	pricesKV: new Keyv({store, namespace: 'prices'}),
	configKV: new Keyv({store, namespace: 'config'}),
}
