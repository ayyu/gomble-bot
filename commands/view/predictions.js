const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { Command } = require('../../models/Command');
const { formatPairs } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('predictions')
	.setDescription('View a list of all active predictions');

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	await Prediction.findAll()
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