const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { requireThreaded } = require('../../utils/threads')
const { Prediction } = require('../../db/models');

const data = new SlashCommandSubcommandBuilder()
	.setName('cancel')
	.setDescription('Cancels this prediction and refunds all bets placed');

module.exports = {
	data,
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(`You can only cancel a prediction in a betting thread.`);

		const prediction = await Prediction.findOne({where: {id: interaction.channel.id}});
		(await prediction.getBets()).forEach(async bet => await bet.refund());
		await prediction.destroy();

		const reason = 'Prediction cancelled';
		const reply = await interaction.reply({
			content: `This prediction has been cancelled. All bets have been refunded.`,
			fetchReply: true,
		});
		await reply.channel.setLocked(true, reason);
		await reply.channel.setArchived(true, reason);
	},
};
