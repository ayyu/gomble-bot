const Keyv = require('keyv');

const dotenv = require('dotenv');

dotenv.config();

module.exports = {
	permsKV: new Keyv(process.env.DATABASE_URL, {namespace: 'perms'}),
	wagesKV: new Keyv(process.env.DATABASE_URL, {namespace: 'wages'}),
	pricesKV: new Keyv(process.env.DATABASE_URL, {namespace: 'prices'}),
}
