const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
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
		.setDescription('How much users start with'));

module.exports = {
	data,
	async execute(interaction) {
		const interval = interaction.options.getString('interval');
		const amount = interaction.options.getInteger('amount');
		const initial = interaction.options.getInteger('initial');

		if (interval != null) await wagesKV.set('interval', interval);
		if (amount != null) await wagesKV.set('amount', amount);
		if (initial != null) await wagesKV.set('initial', initial);

		await interaction.reply('Updated wage settings.');
	},
};