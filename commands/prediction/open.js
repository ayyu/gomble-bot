const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { openBetMsg, threadOnlyMsg } = require('../../utils/messages');
const { requireThreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('open')
	.setDescription('Opens betting for this prediction');

module.exports = {
	data,
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

		const prediction = await Prediction.findOne({ where: { id: interaction.channel.id } });

		await prediction.update({ 'open': true });

		await interaction.reply(openBetMsg);
		const starter = await interaction.channel.fetchStarterMessage();
		const embed = starter.embeds[0];
		console.log(embed);
		embed.description = openBetMsg;
		await starter.edit({ embeds: [embed] });
	},
};
