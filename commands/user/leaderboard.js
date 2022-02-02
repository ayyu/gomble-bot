const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models')

const data = new SlashCommandSubcommandBuilder()
	.setName('leaderboard')
	.setDescription('Check the top and bottom 10 richest players');

async function buildEmbedFields(guild, order, limit) {
	const models = await User.findAll({ order, limit });
	const users = await guild.users.fetch({ user: models.map(model => model.id) });
	console.log(users);
}

module.exports = {
	data,
	async execute(interaction) {
		buildEmbedFields(interaction.guild, [['balance', 'DESC']], 10);
	},
};
