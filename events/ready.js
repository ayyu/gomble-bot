const { User } = require('../db/models');
const { Op } = require('sequelize');
const ms = require('ms');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		const interval = process.env.WAGE_INTERVAL;
		setInterval(async () => {
			try {
				const wage = parseInt(process.env.WAGE_PAY);
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