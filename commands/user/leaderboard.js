const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models');

const records = 5;

const data = new SlashCommandSubcommandBuilder()
	.setName('leaderboard')
	.setDescription(`Check the top ${records} and bottom ${records} players`);

async function buildEmbedFields(interaction, order, limit) {
	const models = await User.findAll({ order, limit });
	console.log(models);
	return models.map(async model => {
		let name = 'Unknown Member';
		const member = await model.getMember(interaction.guild.members);
		if (member) name = member.user.tag;
		const value = `\`\`\`${model.balance} points\`\`\``;
		const embed = { name, value };
		console.log(embed);
		return embed;
	});
}

module.exports = {
	data,
	async execute(interaction) {
		const topFields = await buildEmbedFields(interaction, [['balance', 'DESC']], records);
		const bottomFields = await buildEmbedFields(interaction, [['balance', 'ASC']], records);
		const topEmbed = {
			title: `📈 Top ${records} ballers`,
			fields: topFields,
		};
		const bottomEmbed = {
			title: `📉 Bottom ${records} jobbers`,
			fields: bottomFields,
		};
		await interaction.reply({ embeds: [topEmbed, bottomEmbed] });
	},
};
