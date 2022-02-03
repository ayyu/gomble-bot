const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { updateStarterEmbed } = require('../../utils/embeds');
const { openBetMsg, threadOnlyMsg } = require('../../utils/messages');
const { requireThreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('open')
	.setDescription('Opens betting for this prediction');

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

	const prediction = await Prediction.findOne({ where: { id: interaction.channel.id } });

	await prediction.update({ 'open': true });

	await interaction.reply(openBetMsg);
	await updateStarterEmbed(
		interaction,
		embed => embed.setDescription(openBetMsg),
	);
}

module.exports = {
	data,
	execute,
};
