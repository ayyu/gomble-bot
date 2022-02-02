const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV } = require('../../db/keyv');

const data = new SlashCommandSubcommandBuilder()
	.setName('removebitch')
	.setDescription('Remvoes a user from list of victims')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to remove')
		.setRequired(true));

module.exports = {
	data,
	async execute(interaction) {
		await configKV.delete('bitches');
		await interaction.reply(`Removed all users from hitlist.`);
	}
};