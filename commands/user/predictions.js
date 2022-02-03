const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { Command } = require('../../models/Command');
const { formatPairs } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('predictions')
	.setDescription('Get a list of all active predictions');

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const predictions = await Prediction.findAll();
	const predictionPairs = predictions.map(prediction => [
		`<#${prediction.id}>`,
		`${prediction.open ? 'Open' : 'Closed'} for betting`,
	]);
	await interaction.reply(formatPairs(
		'Active predictions',
		predictionPairs,
		'No active predictions found.',
	));
}

module.exports = new Command(data, execute);
