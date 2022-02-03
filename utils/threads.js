const dotenv = require('dotenv');

dotenv.config();

/**
 * Returns true if the interaction meets the requirements for being in a bot thread.
 * @param {import('discord.js').CommandInteraction} interaction
 * @returns {boolean}
 */
function checkThreaded(interaction) {
	return (interaction.channel.isThread()
		&& interaction.channel.ownerId == process.env.CLIENT_ID);
}
/**
 * Returns true if the interaction meets the requirements for being out of a thread.
 * @param {import('discord.js').CommandInteraction} interaction
 * @returns {boolean}
 */
function checkUnthreaded(interaction) {
	return !interaction.channel.isThread();
}

module.exports = {
	requireThreaded: checkThreaded,
	requireUnthreaded: checkUnthreaded,
};
