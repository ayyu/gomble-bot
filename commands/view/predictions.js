const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { Command } = require('../../models/Command');
const { formatPairs } = require('../../utils/messages');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('predictions')
	.setDescription('View a list of all active predictions');

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	return Prediction.findAll()
		.then(predictions => predictions.map(prediction => [
			`<#${prediction.id}>`,
			`${prediction.open ? 'Open' : 'Closed'} for betting`,
		]))
		.then(pairs => interaction.reply(formatPairs(
			'Active predictions',
			pairs,
			'No active predictions found.',
		)));
}

module.exports = new Command(data, execute);
