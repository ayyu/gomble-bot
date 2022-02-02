const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV } = require('../../db/keyv');

const data = new SlashCommandSubcommandBuilder()
	.setName('clearbitches')
	.setDescription('Removes all users from list of victims');

module.exports = {
	data,
	async execute(interaction) {
		await configKV.delete('bitches');
		await interaction.reply(`Removed all users from hitlist.`);
	}
};