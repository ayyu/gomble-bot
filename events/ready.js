const { User } = require('../db/models');
const { Op } = require('sequelize');
const ms = require('ms');
const dotenv = require('dotenv');
const { wagesKV } = require('../db/keyv');

dotenv.config();

async function paySlaves() {
	try {
		let amount = await wagesKV.get('amount');
		if (amount == null) {
			amount = 1;
			await wagesKV.set('amount', amount);
		}
		await User.increment(
			{balance: amount},
			{where: {id: {[Op.not]: null}}},
		);
		console.log(`Paid ${amount} to all users.`);

		let interval = await wagesKV.get('interval');
		if (interval == null) {
			interval = '1 min';
			await wagesKV.set('interval', interval);
		}
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