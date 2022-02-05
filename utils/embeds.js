const { MessageEmbed } = require('discord.js');
const { Bet } = require('../db/models');
const { openBetMsg, closeBetMsg, getGroupName } = require('./messages');

/**
 * Statistics for a Bet choice.
 * @typedef {Object} ChoiceStats
 * @property {number} pool
 * @property {number} ratio
 * @property {number} count
 * @property {number} max
*/

/**
 * @typedef {import('discord.js').EmbedField} EmbedField
 * @typedef {import('../models/Prediction')} Prediction
 * @typedef {import('discord.js').Message} Message
 * @typedef {import('discord.js').CommandInteraction} CommandInteraction
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
 * @param {Prediction} prediction
 * @returns {Promise<Array<EmbedField>>}
 */
async function buildBetFields(prediction) {
	return Bet.findAll({ where: { predictionId: prediction.id } })
		.then(bets => [true, false].map(choice => {
			const chosenBets = bets.filter(bet => bet.choice == choice);
			const { pool, max, ratio, count } = getChoiceStats(
				chosenBets,
				bets.reduce((total, bet) => total + bet.amount, 0),
			);
			const name = getGroupName(choice);
			const value = `💰 ${pool}\n🏆 1:${ratio.toFixed(2)}\n🧍 ${count}\n💪 ${max}`;
			/** @type {EmbedField} */
			const field = { name, value, inline: true };
			return field;
		}));
}


/**
 * Returns an Embed for a Prediction message.
 * @param {Prediction} prediction
 * @param {string} description - Override for embed description
 * @returns {Promise<MessageEmbed>}
 */
async function startMessageEmbed(prediction, description = null) {
	return buildBetFields(prediction)
		.then((fields) => new MessageEmbed({
			title: prediction.prompt,
			color: colors.open,
			description: description ?? (prediction.open) ? openBetMsg : closeBetMsg,
			fields,
		}));
}

/**
 * @callback editEmbed
 * @param {MessageEmbed} embed
 * @returns {MessageEmbed}
 */

/**
 * Edits the first Embed of an interaction's thread's starter Message.
 * @param {CommandInteraction} interaction
 * @param {editEmbed} callback - A callback to run on the first embed.
 * @returns {Promise<Message>} the thread starter Message
 */
async function updateStarterEmbed(interaction, callback) {
	return interaction.channel.fetchStarterMessage({ force: true })
		.then(starter => {
			/** @type {Array<MessageEmbed>} */
			const embeds = starter.embeds;
			if (embeds[0]) callback(embeds[0]);
			return starter.edit({ embeds });
		});
}

const colors = {
	cancelled: 'RED',
	open: 'GREEN',
	ended: 'BLUE',
	closed: 'ORANGE',
	losers: 'DARK_RED',
	winners: 'DARK_GREEN',
};

module.exports = {
	startMessageEmbed,
	buildBetFields,
	updateStarterEmbed,
	colors,
};
