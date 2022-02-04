const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { User } = require('../../db/models');
const { Command } = require('../../models/Command');
const { colors } = require('../../utils/embeds');

/**
 * How many records to fetch for each list
 * @type {number}
 */
const records = 5;

/**
 * @param {import('discord.js').CommandInteraction} interaction
 * @param {Array<[string, string]>} order
 * @param {number} limit
 * @returns {Array<import('discord.js').EmbedFieldData>}
 */
async function buildEmbedFields(interaction, order, limit) {
	const models = await User.findAll({ order, limit });
	/** @type {Array<import('discord.js').EmbedFieldData>} */
	const fields = await Promise.all(models.map(async model => {
		const member = await model.getMember(interaction.guild.members);
		const name = (member) ? member.user.tag : 'Unknown Member';
		const value = `\`\`\`${model.balance} points\`\`\``;
		return { name, value };
	}));
	return fields;
}

const data = new SlashCommandSubcommandBuilder()
	.setName('leaderboard')
	.setDescription(`Check the top ${records} and bottom ${records} players`);

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const topFields = await buildEmbedFields(interaction, [['balance', 'DESC']], records);
	const bottomFields = await buildEmbedFields(interaction, [['balance', 'ASC']], records);
	const embeds = [
		new MessageEmbed({
			title: `📈 Top ${records} ballers`,
			color: colors.winners,
			fields: topFields,
		}),
		new MessageEmbed({
			title: `📉 Bottom ${records} jobbers`,
			color: colors.losers,
			fields: bottomFields,
		}),
	];
	await interaction.reply({ embeds });
}

module.exports = new Command(data, execute);
