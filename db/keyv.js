const Keyv = require('keyv');

const dotenv = require('dotenv');

dotenv.config();

const ssl = {
	require: true,
	rejectUnauthorized: false,
};

module.exports = {
	permsKV: new Keyv(process.env.DATABASE_URL, {namespace: 'perms', ssl}),
	wagesKV: new Keyv(process.env.DATABASE_URL, {namespace: 'perms', ssl}),
	pricesKV: new Keyv(process.env.DATABASE_URL, {namespace: 'perms', ssl}),
}
