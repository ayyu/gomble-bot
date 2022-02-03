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

	await interaction.reply({ content: '**Prediction**', fetchReply: true })
		.then(reply => reply.pin())
		.then(reply => reply.startThread({ name: `${prompt}`, autoArchiveDuration: 'MAX' })
			.then(thread => Prediction.create({ id: thread.id, prompt, open: true })
				.then(prediction => startMessageEmbed(prediction)
					.then(embed => reply.edit({ embeds: [embed] })))));
}

module.exports = {
	data,
	execute,
};
