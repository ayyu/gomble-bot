const { SlashCommandBuilder } = require('@discordjs/builders');
const { Bet, User, Prediction } = require('../db/models');
const { startMessageEmbed } = require('../utils/embeds');
const { paymentMessage, closeBetMsg, unregisteredMsg, threadOnlyMsg } = require('../utils/messages');
const { requireThreaded } = require('../utils/threads');

const data = new SlashCommandBuilder()
	.setName('bet')
	.setDescription(`Place, raise, or check your bet. Leave options blank to check your bet.`)
	.addIntegerOption(option => option
		.setName('amount')
		.setDescription('How much to wager')
		.setMinValue(1))
	.addBooleanOption(option => option
		.setName('all')
		.setDescription('Whether to go all in'))
	.addBooleanOption(option => option
		.setName('choice')
		.setDescription('The outcome you want to bet on.'));

module.exports = {
	data,
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

		const allIn = interaction.options.getBoolean('all');
		const choice = interaction.options.getBoolean('choice');
		
		const userId = interaction.member.id;
		const predictionId = interaction.channel.id;
		const bet = await Bet.findOne({where: {userId, predictionId}});
		if (amount == null) {
			await interaction.reply(bet
				? `You have a bet of **${bet.amount}** on **${bet.choice}**`
				: `No bet placed yet.`);
			return;
		}

		const user = await User.findOne({where: {id: userId}});
		if (!user) throw new Error(unregisteredMsg);
		
		const amount = allIn ? user.balance : interaction.options.getInteger('amount');
		const prediction = await Prediction.findOne({where: {id: predictionId}});
		if (!prediction.open) throw new Error(closeBetMsg);

		let balance;
		if (!bet) {  // new bet
			if (choice == null) throw new Error(`You must choose an outcome when placing a bet.`);
			
			balance = await user.spend(amount);
			try {
				await Bet.create({userId, predictionId, choice, amount});
			} catch (error) {
				await user.earn(amount);
				throw error;
			}
			await interaction.reply(`New bet placed on **${choice}** for **${amount}**`);

		} else {  // add to existing bet
			if (choice != null
				&& choice != bet.choice) throw new Error(`You can't bet against your initial choice.`);

			balance = await user.spend(amount);
			try {
				await bet.increment({amount});
			} catch (error) {
				await user.earn(amount);
				throw error;
			}
			await bet.reload();
			await interaction.reply(`Bet raised on **${bet.choice}** by **${amount}** to **${bet.amount}**`);
		}

		const starter = await interaction.channel.fetchStarterMessage();
		const embed = await startMessageEmbed(prediction);
		await starter.edit({embeds: [embed]});
		await interaction.followUp(paymentMessage(amount, balance));
	},
};
