const ms = require('ms');
const dotenv = require('dotenv');
const { payWages, prune } = require('../utils/periodic');
const { Client } = require('discord.js');

dotenv.config();

module.exports = {
	name: 'ready',
	once: true,
	/**
	 * @param {Client} client
	 */
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		const guild = await client.guilds.fetch(process.env.GUILD_ID);

		await payWages(guild);
		setTimeout(prune, ms('30 min'), guild);
	},
};