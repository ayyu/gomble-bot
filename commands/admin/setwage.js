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
		.setDescription('How much to pay'));

module.exports = {
	data,
	async execute(interaction) {
		const interval = interaction.options.getString('interval');
		const amount  = interaction.options.getInteger('amount');

		if (interval != null) await wagesKV.set('interval', interval);
		if (amount != null) await wagesKV.set('amount', amount);

		await interaction.reply(`Updated wage settings to ${amount} every ${interval}.`);
	}
};