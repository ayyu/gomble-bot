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
		const target = interaction.options.getMember('user');

		const bitches = await configKV.get('bitches') ?? new Set();
		bitches.delete(target.id);
		await configKV.set('bitches', bitches);

		await interaction.reply(`Removed ${target.user.tag} from hitlist.`);
	}
};