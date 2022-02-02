const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models')

const limit = 5;

const data = new SlashCommandSubcommandBuilder()
	.setName('leaderboard')
	.setDescription(`Check the top ${limit} and bottom ${limit} players`);

async function buildEmbedFields(interaction, order, limit) {
	const models = await User.findAll({ order, limit });
	const members = await interaction.guild.members.fetch({ user: models.map(model => model.id) });
	return models.map((row, index) => {
		const member = members.get(row.id);
		return {
			name: `${(index + 1)}. ${member.user.tag}`,
			value: `\`\`\`${row.balance} points\`\`\``,
		}
	});
}

module.exports = {
	data,
	async execute(interaction) {
		const topFields = await buildEmbedFields(interaction, [['balance', 'DESC']], limit);
		const bottomFields = await buildEmbedFields(interaction, [['balance', 'ASC']], limit);
		const topEmbed = {
			title: `📈 Top ${limit} ballers`,
			fields: topFields
		};
		const bottomEmbed = {
			title: `📉 Bottom ${limit} jobbers`,
			fields: bottomFields
		};
		await interaction.reply({embeds: [topEmbed, bottomEmbed]});
	},
};
