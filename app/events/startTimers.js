const ms = require('ms');
const dotenv = require('dotenv');
const { payWages, prune } = require('../utils/periodic');
/** @typedef {import('discord.js').Client} Client */

dotenv.config();

module.exports = {
	name: 'ready',
	once: true,
	/**
	 * @param {Client} client
	 */
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		return client.guilds.fetch(process.env.GUILD_ID)
			.then(guild => payWages(guild))
			.then(guild => setTimeout(prune, ms('30 min'), guild))
			.catch(error => console.error(error));
	},
};
