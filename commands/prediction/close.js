const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { updateStarterEmbed } = require('../../utils/embeds');
const { closeBetMsg, threadOnlyMsg } = require('../../utils/messages');
const { requireThreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('close')
	.setDescription('Closes betting for this prediction');

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

	const prediction = await Prediction.findOne({ where: { id: interaction.channel.id } });

	await prediction.update({ 'open': false });

	await interaction.reply(closeBetMsg);
	await updateStarterEmbed(
		interaction,
		embed => embed.setDescription(closeBetMsg),
	);
}

module.exports = {
	data,
	execute,
};
