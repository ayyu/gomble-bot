const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Bet, User, Prediction } = require('../../db/models');
const { startMessageEmbed, resultEmbed } = require('../../utils/embeds');
const { requireThreaded, closeThread } = require('../../utils/threads');

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
		if (!requireThreaded(interaction)) throw new Error(`You can only end a prediction in a betting thread.`);

		const choice = interaction.options.getBoolean('result');
		const prediction = await Prediction.findOne({where: {id: interaction.channel.id}});
		const predictionId = prediction.id;

		const respEmbed = await resultEmbed(prediction, choice);
		const startEmbed = await startMessageEmbed(prediction, respEmbed.title);

		const totalPool = await Bet.sum('amount', {where: {predictionId}});
		const winningPool = await Bet.sum('amount', {where: {predictionId, choice}});
		const winningBets = await Bet.findAll({
			where: {predictionId, choice},
			include: User
		});

		winningBets.forEach(async bet => {
			await bet.user.earn(Math.round(bet.amount * totalPool / winningPool));
		});

		await prediction.destroy();
		
		await interaction.reply({embeds: [respEmbed]});
		const starter = await interaction.channel.fetchStarterMessage();
		await starter.edit({embeds: [startEmbed]});
		await starter.unpin();
		await interaction.channel.setLocked(true);
		await interaction.channel.setArchived(true);
	},
};
