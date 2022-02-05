const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { Command } = require('../../models/Command');
const { updateStarterEmbed, colors } = require('../../utils/embeds');
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

	await Prediction.findOne({ where: { id: interaction.channel.id } })
		.then(prediction => prediction.update({ 'open': false }));

	await updateStarterEmbed(interaction, embed => embed
		.setDescription(closeBetMsg)
		.setColor(colors.closed))
		.then(() => interaction.reply(closeBetMsg));
}

module.exports = new Command(data, execute);
