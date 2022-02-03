const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { wagesKV } = require('../../db/keyv');

const data = new SlashCommandSubcommandBuilder()
	.setName('setwage')
	.setDescription('Sets passive income')
	.addStringOption(option => option
		.setName('interval')
		.setDescription('How often to pay'))
	.addIntegerOption(option => option
		.setName('amount')
		.setDescription('How much to pay'))
	.addIntegerOption(option => option
		.setName('initial')
		.setDescription('How much users start with'))
	.addNumberOption(option => option
		.setName('boost')
		.setDescription('Multiplier for boosters'))
	.addIntegerOption(option => option
		.setName('minbet')
		.setDescription('Minimum bet amount'));

module.exports = {
	data,
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		const settings = {
			interval: interaction.options.getString('interval'),
			amount: interaction.options.getInteger('amount'),
			initial: interaction.options.getInteger('initial'),
			boost: interaction.options.getNumber('boost'),
			minBet: interaction.options.getInteger('minbet'),
		};

		await interaction.reply('Updating wage settings.');
		for (const key in settings) {
			if (settings[key] != null) {
				await wagesKV.set(key, settings[key]);
				await interaction.followUp(`Updated ${key} to ${settings[key]}`);
			}
		}
	},
};