const ms = require('ms');
const dotenv = require('dotenv');
const { payWages, pruneMembers } = require('../utils/periodic');

dotenv.config();

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		const guild = await client.guilds.fetch(process.env.GUILD_ID);

		await payWages(guild);
		setTimeout(pruneMembers, ms('1 hour'), guild);
	},
};