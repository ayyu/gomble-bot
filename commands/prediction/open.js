const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { startMessageEmbed } = require('../../utils/embeds');
const { requireThreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('open')
	.setDescription('Opens betting for this prediction');

module.exports = {
	data,
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(`You can only open a prediction in a betting thread.`);

		const prediction = await Prediction.findOne({where: {id: interaction.channel.id}});

		const response = 'Betting is open. Place bets in the thread with \`/bet\`';
		await prediction.update({'open': true});

		const starter = await interaction.channel.fetchStarterMessage();
		const embed = await startMessageEmbed(prediction, response);
		await starter.edit({embeds: [embed]});
		await interaction.reply(response);
	},
};
