const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { startMessageEmbed } = require('../../utils/embeds');
const { requireThreaded, closeThread } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('cancel')
	.setDescription('Cancels this prediction and refunds all bets placed');

module.exports = {
	data,
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(`You can only cancel a prediction in a betting thread.`);

		const prediction = await Prediction.findOne({where: {id: interaction.channel.id}});
		
		const response = `This prediction has been cancelled. All bets have been refunded.`;
		const startEmbed = await startMessageEmbed(prediction, response);

		(await prediction.getBets()).forEach(async bet => await bet.refund());
		await prediction.destroy();

		await interaction.reply(response);
		const starter = await interaction.channel.fetchStarterMessage();
		await starter.edit({embeds: [startEmbed]});
		await starter.unpin();
		await interaction.channel.setLocked(true);
		await interaction.channel.setArchived(true);
	},
};
