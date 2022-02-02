const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models')

const data = new SlashCommandSubcommandBuilder()
	.setName('leaderboard')
	.setDescription('Check the top and bottom 10 richest players');

async function buildEmbedFields(interaction, order, limit) {
	const models = await User.findAll({ order, limit });
	const members = await interaction.guild.members.fetch({ user: models.map(model => model.id) });
	return models.map((row, index) => {
		const member = members.get(row.id);
		return {
			name: `${(index + 1)}. ${member.nickname ?? member.user.username}`,
			value: `\`\`\`${row.balance} points\`\`\``,
		}
	});
}

module.exports = {
	data,
	async execute(interaction) {
		const top10Fields = await buildEmbedFields(interaction, [['balance', 'DESC']], 10);
		const bottom10Fields = await buildEmbedFields(interaction, [['balance', 'ASC']], 10);
		const top10Embed = {
			title: 'Top 10 ballers',
			fields: top10Fields
		};
		const bottom10Embed = {
			title: 'Bottom 10 jobbers',
			fields: bottom10Fields
		};
		await interaction.reply({embeds: [top10Embed, bottom10Embed]});
	},
};
