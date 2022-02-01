const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { requireThreaded } = require('../../utils/threads');
const { resultEmbed } = require('../../utils/embeds');
const { Bet, User, Prediction } = require('../../db/models');

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

		const embed = await resultEmbed(prediction, choice);
		await updateStarterEmbed(interaction.channel, prediction, embed.title);
		
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
		
		const reason = 'Prediction ended';
		const reply = await interaction.reply({
			content: `**This prediction has ended.**`,
			embeds: [embed],
			fetchReply: true,
		});
		await reply.channel.setLocked(true, reason);
		await reply.channel.setArchived(true, reason);
	},
};
