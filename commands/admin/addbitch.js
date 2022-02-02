const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV } = require('../../db/keyv');

const data = new SlashCommandSubcommandBuilder()
	.setName('addbitch')
	.setDescription('Adds a user to list of victims')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to add')
		.setRequired(true));

module.exports = {
	data,
	async execute(interaction) {
		const target = interaction.options.getMember('user');

		const bitches = await configKV.get('bitches') ?? new Set();
		bitches.add(target.id);
		await configKV.set('bitches', bitches);

		await interaction.reply(`Added ${target.user.tag} to hitlist.`);
	}
};