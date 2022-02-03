const { MessageEmbed } = require('discord.js');
const { Bet } = require('../db/models');
const { openBetMsg, closeBetMsg } = require('./messages');

/**
 * Statistics for a Bet choice.
 * @typedef {Object} ChoiceStats
 * @property {number} pool
 * @property {number} ratio
 * @property {number} count
 * @property {number} max
*/

/**
 * Gets stats for building an Embed field of a Prediction choice.
 * @param {Array<Bet>} bets - Bets of choice
 * @param {number} totalPool - Total of Bet amounts for this Prediction
 * @returns {ChoiceStats}
 */
function getChoiceStats(bets, totalPool) {
	const pool = bets.reduce((total, bet) => total + bet.amount, 0);
	const ratio = (pool == 0) ? 1 : totalPool / pool;
	const count = bets.length;
	const max = bets.reduce((lowest, bet) => Math.max(lowest, bet.amount), 0);
	return { pool, max, ratio, count };
}

/**
 * Returns Array of EmbedFields for a Prediction.
 * @param {import('../db/models').Prediction} prediction
 * @returns {Array<import('discord.js').EmbedFieldData>}
 */
async function buildBetFields(prediction) {
	const bets = await Bet.findAll({ where: { predictionId: prediction.id } });
	const totalPool = bets.reduce((total, bet) => total + bet.amount, 0);
	const choices = [true, false];
	return choices.map(choice => {
		const chosenBets = bets.filter(bet => bet.choice == choice);
		const { pool, max, ratio, count } = getChoiceStats(chosenBets, totalPool);
		const name = choice ? 'Believers' : 'Doubters';
		const value = `💰 ${pool}\n🏆 1:${ratio.toFixed(2)}\n🧍 ${count}\n💪 ${max}`;
		return { name, value, inline: true };
	});
}

/**
 * Returns an Embed for a Prediction message.
 * @param {import('../db/models').Prediction} prediction
 * @param {string} description - Override for embed description
 * @returns {MessageEmbed}
 */
async function startMessageEmbed(prediction, description = null) {
	const title = prediction.prompt;
	if (description == null) description = (prediction.open) ? openBetMsg : closeBetMsg;
	const fields = await buildBetFields(prediction);
	return new MessageEmbed({ title, description, fields });
}

/**
 * Edits the first Embed of an interaction's thread's starter Message.
 * @param {import('discord.js').CommandInteraction} interaction
 * @param {Function} callback - A callback to run on the first embed.
 * @returns {import('discord.js').Message} the thread starter Message
 */
async function updateStarterEmbed(interaction, callback) {
	const starter = await interaction.channel.fetchStarterMessage({ force: true });
	const embeds = starter.embeds;
	if (embeds[0]) {
		callback(embeds[0]);
		await starter.edit({ embeds });
	}
	return starter;
}

module.exports = {
	startMessageEmbed,
	buildBetFields,
	updateStarterEmbed,
};
