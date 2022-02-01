const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { startMessageEmbed } = require('../../utils/embeds');
const { closeBetMsg, threadOnlyMsg } = require('../../utils/messages');
const { requireThreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('close')
	.setDescription('Closes betting for this prediction');

module.exports = {
	data,
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

		const prediction = await Prediction.findOne({where: {id: interaction.channel.id}});

		await prediction.update({'open': false});
		
		await interaction.reply(closeBetMsg);
		const starter = await interaction.channel.fetchStarterMessage();
		const embed = await startMessageEmbed(prediction, closeBetMsg);
		await starter.edit({embeds: [embed]});
	},
};
