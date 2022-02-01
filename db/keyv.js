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
	permsKV: new Keyv(Object.assign({namespace: 'perms'}, store)),
	wagesKV: new Keyv(Object.assign({namespace: 'wages'}, store)),
	pricesKV: new Keyv(Object.assign({namespace: 'prices'}, store)),
}
