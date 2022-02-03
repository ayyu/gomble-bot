const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { startMessageEmbed } = require('../../utils/embeds');
const { channelOnlyMsg } = require('../../utils/messages');
const { requireUnthreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('start')
	.setDescription('Starts a new prediction')
	.addStringOption(option => option
		.setName('prompt')
		.setDescription('Prompt for prediction')
		.setRequired(true));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	if (!requireUnthreaded(interaction)) throw new Error(channelOnlyMsg);
	const prompt = interaction.options.getString('prompt');

	const reply = await interaction.reply({
		content: '**Prediction**',
		fetchReply: true,
	});

	/** @type {import('discord.js').ThreadChannel} */
	const thread = await reply.startThread({
		name: `${prompt}`,
		autoArchiveDuration: 'MAX',
	});

	const prediction = await Prediction.create({
		id: thread.id,
		prompt,
		open: true,
	});

	const embed = await startMessageEmbed(prediction);
	await reply.edit({ embeds: [embed] });
	await reply.pin();
}

module.exports = {
	data,
	execute,
};
