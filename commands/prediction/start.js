const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { Command } = require('../../models/Command');
const { startMessageEmbed } = require('../../utils/embeds');
const { requireUnthreaded, sanitizeThreadName } = require('../../utils/threads');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('start')
	.setDescription('Starts a new prediction')
	.addStringOption(option => option
		.setName('prompt')
		.setDescription('Prompt for prediction')
		.setRequired(true));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	requireUnthreaded(interaction);

	const prompt = interaction.options.getString('prompt');
	const name = sanitizeThreadName(prompt);
	await interaction.reply({ content: '**Prediction**', fetchReply: true })
		.then(reply => reply.pin())
		.then(reply => reply.startThread({ name, autoArchiveDuration: 'MAX' })
			.then(thread => Prediction.create({ id: thread.id, prompt, open: true }))
			.then(prediction => startMessageEmbed(prediction))
			.then(embed => reply.edit({ embeds: [embed] })));
}

module.exports = new Command(data, execute);
