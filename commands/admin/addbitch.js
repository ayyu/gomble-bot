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

		const bitches = await configKV.get('bitches') ?? [];
		const bitchSet = new Set(bitches);
		bitchSet.add(target.id);
		console.log(bitchSet);
		await configKV.set('bitches', bitchSet.values());

		await interaction.reply(`Added ${target.user.tag} to hitlist.`);
	}
};