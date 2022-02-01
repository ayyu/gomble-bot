const Keyv = require('keyv');
const dotenv = require('dotenv');

dotenv.config();

dbURL = process.env.DATABASE_URL + '?sslmode=require'

module.exports = {
	permsKV: new Keyv(dbURL, {namespace: 'perms'}),
	wagesKV: new Keyv(dbURL, {namespace: 'wages'}),
	pricesKV: new Keyv(dbURL, {namespace: 'prices'}),
}
