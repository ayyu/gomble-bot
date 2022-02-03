const { CommandInteraction } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
	/**
	 * Returns true if the interaction meets the requirements for being in a bot thread.
	 * @param {CommandInteraction} interaction
	 * @returns {Boolean}
	 */
	requireThreaded(interaction) {
		return (interaction.channel.isThread()
			&& interaction.channel.ownerId == process.env.CLIENT_ID);
	},
	/**
	 * Returns true if the interaction meets the requirements for being out of a thread.
	 * @param {CommandInteraction} interaction
	 * @returns {Boolean}
	 */
	requireUnthreaded(interaction) {
		return !interaction.channel.isThread();
	},
};
