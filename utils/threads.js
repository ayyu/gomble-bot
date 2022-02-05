const dotenv = require('dotenv');
const { threadOnlyMsg, channelOnlyMsg } = require('./messages');

dotenv.config();

/**
 * @typedef {import('discord.js').CommandInteraction} CommandInteraction
 */

/**
 * Returns true if the interaction is from a bot thread.
 * @param {CommandInteraction} interaction
 * @returns {boolean}
 */
function checkThreaded(interaction) {
	return (interaction.channel.isThread()
			&& interaction.channel.ownerId == process.env.CLIENT_ID);
}

/**
 * Throws an errror if the interaction isn't from a bot thread.
 * @param {CommandInteraction} interaction
 * @throws {Error}
 */
function requireThreaded(interaction) {
	if (!checkThreaded(interaction)) throw new Error(threadOnlyMsg);
}

/**
 * Returns true if the interaction is out of a thread.
 * @param {CommandInteraction} interaction
 * @returns {boolean}
 */
function checkUnthreaded(interaction) {
	return !interaction.channel.isThread();
}

/**
 * Throws an errror if the interaction isn't out of a thread.
 * @param {CommandInteraction} interaction
 * @throws {Error}
 */
function requireUnthreaded(interaction) {
	if (!checkUnthreaded(interaction)) throw new Error(channelOnlyMsg);
}

const reEmoji = /<a?:(\w+):[0-9]+>/;

/**
 * Filter out Discord emote tag from thread name.
 * @param {string} name
 * @param {RegExp} re
 * @returns {string}
 */
function sanitizeThreadName(name, re = reEmoji) {
	return name.replace(re, '$1');
}

module.exports = {
	requireThreaded,
	requireUnthreaded,
	sanitizeThreadName,
};
