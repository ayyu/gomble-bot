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
		.setDescription('Multiplier for boosters'));

module.exports = {
	data,
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		const interval = interaction.options.getString('interval');
		const amount = interaction.options.getInteger('amount');
		const initial = interaction.options.getInteger('initial');
		const boost = interaction.options.getNumber('boost');

		await interaction.reply('Updating wage settings.');
		const settings = { interval, amount, initial, boost };
		for (const key in settings) {
			if (settings[key] != null) {
				await wagesKV.set(key, settings[key]);
				await interaction.followUp(`Updated ${key} to ${settings[key]}`);
			}
		}
	},
};