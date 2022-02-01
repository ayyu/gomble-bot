const { User } = require('../db/models');
const { currency } = require('../kv/connect');
const { currency: currencyJSON } = require('../config.json');
const { Op } = require('sequelize');
const ms = require('ms');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		for (const property in currencyJSON) {
			const value = await currency.get(property);
			if (value == null) await currency.set(property, currencyJSON[property]);
		}
		const interval = await currency.get('interval');
		setInterval(async () => {
			try {
				const wage = await currency.get('wage');
				await User.increment(
					{balance: wage},
					{where: {id: {[Op.not]: null}}},
				);
				console.log(`Paid ${wage} to all users.`);
			} catch (error) {
				console.error(error);
			}
		}, ms(interval));
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};