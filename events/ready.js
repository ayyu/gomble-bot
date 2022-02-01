const { User } = require('../db/models');
const { Op } = require('sequelize');
const ms = require('ms');
const dotenv = require('dotenv');
const { wagesKV } = require('../db/keyv');

dotenv.config();

async function paySlaves() {
	try {
		const hasAmount = await wagesKV.has('amount');
		if (!hasAmount) await wagesKV.set('amount', 1);
		const amount = await wagesKV.get('amount');
		await User.increment(
			{balance: amount},
			{where: {id: {[Op.not]: null}}},
		);
		console.log(`Paid ${amount} to all users.`);

		const hasInterval = await wagesKV.has('interval');
		if (!hasInterval) await wagesKV.set('interval', '1 min');
		const interval = await wagesKV.get('interval');
		setTimeout(paySlaves, ms(interval));
		console.log(`Next payment is in ${interval}.`);
	} catch (error) {
		console.error(error);
	}
}

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		await paySlaves();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};