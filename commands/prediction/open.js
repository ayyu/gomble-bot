const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { requireThreaded } = require('../../utils/threads')

const data = new SlashCommandSubcommandBuilder()
	.setName('open')
	.setDescription('Opens betting for this prediction');

module.exports = {
	data,
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(`You can only open a prediction in a betting thread.`);
		const prediction = await Prediction.findOne({where: {id: interaction.channel.id}});
		prediction.update({'open': true});
		await interaction.reply(`Betting is now open for this prediction.`);
	},
};
