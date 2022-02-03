const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { Prediction } = require('../../db/models');
const { formatPairs } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('predictions')
	.setDescription('Get a list of all active predictions');

module.exports = {
	data,
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		const predictions = await Prediction.findAll();
		const predictionPairs = predictions.map(prediction => [
			`**<#${prediction.id}>**`,
			`${prediction.open ? 'Open' : 'Closed'} for betting`,
		]);
		await interaction.reply(formatPairs(
			'Active predictions',
			predictionPairs,
			'No active predictions found.',
		));
	},
};
