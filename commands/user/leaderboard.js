const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { User } = require('../../db/models');

const records = 5;

const data = new SlashCommandSubcommandBuilder()
	.setName('leaderboard')
	.setDescription(`Check the top ${records} and bottom ${records} players`);

/**
 * @param {CommandInteraction} interaction
 * @param {Array<Array>} order
 * @param {Number} limit
 * @returns {Array<Object>}
 */
async function buildEmbedFields(interaction, order, limit) {
	const models = await User.findAll({ order, limit });
	const fields = await Promise.all(models.map(async model => {
		const member = await model.getMember(interaction.guild.members);
		const name = (member) ? member.user.tag : 'Unknown Member';
		const value = `\`\`\`${model.balance} points\`\`\``;
		return { name, value };
	}));
	return fields;
}

module.exports = {
	data,
	/**
	 * @param {CommandInteraction} interaction
	 */
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
