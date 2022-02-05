const dotenv = require('dotenv');
/** @typedef {import('discord.js').Message} Message */

dotenv.config();

module.exports = {
	name: 'messageCreate',
	/**
	 * @param {Message} message
	 */
	async execute(message) {
		if (message.author.id == process.env.CLIENT_ID
			&& message.type == 'CHANNEL_PINNED_MESSAGE') {
			await message.delete();
		}
	},
};
