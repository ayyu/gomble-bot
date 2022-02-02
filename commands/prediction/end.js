const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Bet, User, Prediction } = require('../../db/models');
const { startMessageEmbed, resultEmbed } = require('../../utils/embeds');
const { threadOnlyMsg } = require('../../utils/messages');
const { requireThreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('end')
	.setDescription('Ends the prediction and pays out to winners')
	.addBooleanOption(option => option
		.setName('result')
		.setDescription('The correct result of the prediction')
		.setRequired(true));

module.exports = {
	data,
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

		const choice = interaction.options.getBoolean('result');

		const prediction = await Prediction.findOne({ where: { id: interaction.channel.id } });
		const predictionId = prediction.id;

		const respEmbed = await resultEmbed(prediction, choice);
		const startEmbed = await startMessageEmbed(prediction, respEmbed.title);

		await interaction.reply({ embeds: [respEmbed] });
		const starter = await interaction.channel.fetchStarterMessage();
		await starter.edit({ embeds: [startEmbed] });
		await starter.unpin();

		const totalPool = await Bet.sum('amount', { where: { predictionId } });
		const winningPool = await Bet.sum('amount', { where: { predictionId, choice } });
		const winningBets = await Bet.findAll({
			where: { predictionId, choice },
			include: User,
		});
		for (const bet of winningBets) {
			const member = await bet.user.getMember(interaction.guild.members) ?? 'Unknown member';
			const payout = Math.round(bet.amount / winningPool * totalPool);
			await bet.user.earn(payout);
			await interaction.followUp(`${member} won **${payout}**.`);
		}

		await prediction.destroy();

		await interaction.channel.setLocked(true);
		await interaction.channel.setArchived(true);
	},
};
