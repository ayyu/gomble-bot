const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { Prediction } = require('../../db/models');

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
		let response = '**Active predictions:**\n';
		const predictionList = predictions.reduce((content, prediction) => {
			return content + `<#${prediction.id}>: ${prediction.open ? 'Open' : 'Closed'} for betting\n`;
		}, '');
		response += (predictionList.length) ? predictionList : 'No active predictions found.';
		await interaction.reply(response);
	},
};
