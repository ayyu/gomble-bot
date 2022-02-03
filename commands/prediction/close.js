const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { Prediction } = require('../../db/models');
const { updateStarterEmbed } = require('../../utils/embeds');
const { closeBetMsg, threadOnlyMsg } = require('../../utils/messages');
const { requireThreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('close')
	.setDescription('Closes betting for this prediction');

module.exports = {
	data,
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

		const prediction = await Prediction.findOne({ where: { id: interaction.channel.id } });

		await prediction.update({ 'open': false });

		await interaction.reply(closeBetMsg);
		await updateStarterEmbed(interaction, embed => embed.setDescription(closeBetMsg));
	},
};
