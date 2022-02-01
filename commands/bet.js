const { SlashCommandBuilder } = require('@discordjs/builders');
const { Bet, User, Prediction } = require('../db/models');
const { startMessageEmbed } = require('../utils/embeds');
const { paymentMessage } = require('../utils/payment');
const { requireThreaded } = require('../utils/threads');

const data = new SlashCommandBuilder()
	.setName('bet')
	.setDescription('Place, raise, or check your bet')
	.addIntegerOption(option => option
		.setName('amount')
		.setDescription('How much you want to wager. Leave blank to check your bet.')
		.setMinValue(1))
	.addBooleanOption(option => option
		.setName('choice')
		.setDescription('The outcome you want to bet on.'));

module.exports = {
	data,
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(`You can only bet in a betting thread.`);
		const choice = interaction.options.getBoolean('choice');
		const amount = interaction.options.getInteger('amount');

		const userId = interaction.member.id;
		const predictionId = interaction.channel.id;
		const bet = await Bet.findOne({where: {userId, predictionId}});
		const user = await User.findOne({where: {id: userId}});

		if (!user) throw new Error(`User is not registered.`);
		if (amount == null) {
			await interaction.reply(bet ? `You have a bet of **${bet.amount}** on **${bet.choice}**` : `No bet placed yet.`);
			return;
		}
		
		const prediction = await Prediction.findOne({where: {id: predictionId}});
		let balance;
		if (!prediction.open) throw new Error(`This prediction is closed for betting.`);
		if (!bet) {  // new bet
			if (choice == null) throw new Error(`You must choose an outcome for an initial bet.`);
			balance = await user.spend(amount);
			await Bet.create({userId, predictionId, choice, amount});
			await interaction.reply(`New bet placed on **${choice}** for **${amount}**`);
		} else {  // add to existing bet
			if (choice != null && choice != bet.choice) throw new Error(`You can't bet against your initial choice.`);
			balance = await user.spend(amount);
			await bet.increment({amount});
			await bet.reload();
			await interaction.reply(`Bet raised on **${bet.choice}** by **${amount}** to **${bet.amount}**`);
		}

		const starter = await interaction.channel.fetchStarterMessage();
		const embed = await startMessageEmbed(prediction);
		await starter.edit({embeds: [embed]});
		await interaction.followUp(paymentMessage(amount, balance));
	},
};
