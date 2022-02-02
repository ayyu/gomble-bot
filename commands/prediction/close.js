const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { closeBetMsg, threadOnlyMsg } = require('../../utils/messages');
const { requireThreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('close')
	.setDescription('Closes betting for this prediction');

module.exports = {
	data,
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

		const prediction = await Prediction.findOne({ where: { id: interaction.channel.id } });

		await prediction.update({ 'open': false });

		await interaction.reply(closeBetMsg);
		const starter = await interaction.channel.fetchStarterMessage();
		const embeds = starter.embeds;
		if (embeds[0]) embeds[0].description = closeBetMsg;
		await starter.edit({ embeds });
	},
};
