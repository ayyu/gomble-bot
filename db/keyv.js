const Keyv = require('keyv');

const dotenv = require('dotenv');

dotenv.config();

dbURL = process.env.DATABASE_URL + '?ssl=true'

module.exports = {
	permsKV: new Keyv(dbURL, {namespace: 'perms'}),
	wagesKV: new Keyv(dbURL, {namespace: 'perms'}),
	pricesKV: new Keyv(dbURL, {namespace: 'perms'}),
}
