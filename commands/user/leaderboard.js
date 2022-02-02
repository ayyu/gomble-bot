const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models')

const data = new SlashCommandSubcommandBuilder()
	.setName('leaderboard')
	.setDescription('Check the top and bottom 10 richest players');

async function buildEmbedFields(interaction, order, limit) {
	const models = await User.findAll({ order, limit });
	const users = await interaction.guild.users.fetch({ user: models.map(model => model.id) });
	console.log(users);
}

module.exports = {
	data,
	async execute(interaction) {
		await buildEmbedFields(interaction, [['balance', 'DESC']], 10);
	},
};
