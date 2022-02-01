const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { startMessageEmbed } = require('../../utils/embeds');
const { requireThreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('close')
	.setDescription('Closes betting for this prediction');

module.exports = {
	data,
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(`You can only close a prediction in a betting thread.`);

		const prediction = await Prediction.findOne({where: {id: interaction.channel.id}});

		const response = `Betting is now closed for this prediction.`;
		await prediction.update({'open': false});
		
		await interaction.reply(response);
		const starter = await interaction.channel.fetchStarterMessage();
		const embed = await startMessageEmbed(prediction, response);
		await starter.edit({embeds: [embed]});
	},
};
