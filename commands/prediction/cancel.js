const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { startMessageEmbed } = require('../../utils/embeds');
const { cancelBetMsg, threadOnlyMsg } = require('../../utils/messages');
const { requireThreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('cancel')
	.setDescription('Cancels this prediction and refunds all bets placed');

module.exports = {
	data,
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

		const prediction = await Prediction.findOne({ where: { id: interaction.channel.id } });

		const startEmbed = await startMessageEmbed(prediction, cancelBetMsg);

		const bets = await prediction.getBets();
		for (const bet of bets) await bet.refund();
		await prediction.destroy();

		await interaction.reply(cancelBetMsg);
		const starter = await interaction.channel.fetchStarterMessage();
		await starter.edit({ embeds: [startEmbed] });
		await starter.unpin();
		await interaction.channel.setLocked(true);
		await interaction.channel.setArchived(true);
	},
};
