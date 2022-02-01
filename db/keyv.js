const Keyv = require('keyv');

const dotenv = require('dotenv');

dotenv.config();

const keyvs = {
	permsKV: new Keyv(process.env.DATABASE_URL, {namespace: 'perms'}),
	wagesKV: new Keyv(process.env.DATABASE_URL, {namespace: 'wages'}),
	pricesKV: new Keyv(process.env.DATABASE_URL, {namespace: 'prices'}),
}
for (const keyv in keyvs) keyv.on('error', error => console.error('Keyv connection error:', error));

module.exports = keyvs;
