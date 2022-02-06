const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { Command } = require('../../models/Command');
const { updateStarterEmbed } = require('../../utils/embeds');
const { requireThreaded } = require('../../utils/threads');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('edit')
	.setDescription('Edit prediction prompt')
	.addStringOption(option => option
		.setName('prompt')
		.setDescription('new prompt to use')
		.setRequired(true));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	requireThreaded(interaction);
	const prompt = interaction.options.getString('prompt');
	return Prediction.findOne({ where: { id: interaction.channel.id } })
		.then(prediction => prediction.update({ 'prompt': prompt }))
		.then(() => updateStarterEmbed(interaction, embed => embed
			.setDescription(prompt)));
}

module.exports = new Command(data, execute);
