const dotenv = require('dotenv');
/** @typedef {import('discord.js').Message} Message */

dotenv.config();

const deleteTypes = [
	'CHANNEL_PINNED_MESSAGE',
];

module.exports = {
	name: 'messageCreate',
	/**
	 * @param {Message} message
	 */
	async execute(message) {
		if (message.author.id == process.env.CLIENT_ID
			&& deleteTypes.includes(message.type)) {
			return message.delete();
		}
	},
};
