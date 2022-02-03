const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { wagesKV } = require('../db/keyv');
const { Bet, User, Prediction } = require('../db/models');
const { buildBetFields, updateStarterEmbed } = require('../utils/embeds');
const { paymentMessage, closeBetMsg, unregisteredMsg, threadOnlyMsg } = require('../utils/messages');
const { requireThreaded } = require('../utils/threads');

const data = new SlashCommandBuilder()
	.setName('bet')
	.setDescription('Place, raise, or check your bet. Leave options blank to check your bet.')
	.addStringOption(option => option
		.setName('amount')
		.setDescription('How much to wager. Valid options are integers and all'))
	.addBooleanOption(option => option
		.setName('choice')
		.setDescription('The outcome you want to bet on.'));

module.exports = {
	data,
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

		/** @type {string|number} */
		let amount = interaction.options.getString('amount');
		const choice = interaction.options.getBoolean('choice');

		const userId = interaction.member.id;
		const predictionId = interaction.channel.id;

		const prediction = await Prediction.findOne({ where: { id: predictionId } });
		if (!prediction.open) throw new Error(closeBetMsg);

		const user = await User.findOne({ where: { id: userId } });
		if (!user) throw new Error(unregisteredMsg);

		const bet = await Bet.findOne({ where: { userId, predictionId } });

		if (amount == null && choice == null) {
			await interaction.reply(bet
				? `You have a bet of **${bet.amount}** on **${bet.choice}**`
				: 'No bet placed yet.');
			return;
		}

		if (amount == null) throw new Error('You must choose an amount when placing or raising a bet.');
		if (choice == null) {
			if (!bet) throw new Error('You must choose an outcome when placing a bet.');
		} else if (bet && choice != bet.choice) {
			throw new Error('You can\'t bet against your initial choice.');
		}

		if (amount == 'all') {
			amount = user.balance;
		} else if (isNaN(amount)) {
			throw new Error('You can only use `all` or integers as amounts.');
		} else {
			amount = parseInt(amount);
		}

		const minBet = await wagesKV.get('minBet') ?? 1;
		if (amount < minBet) throw new Error(`Your bet must be at least ${minBet}.`);

		const balance = await user.spend(amount);
		if (!bet) {
			try {
				await Bet.create({ userId, predictionId, choice, amount });
			} catch (error) {
				await user.earn(amount);
				throw error;
			}
			await interaction.reply(`New bet placed on **${choice}** for **${amount}**`);
		} else {
			try {
				await bet.increment({ amount });
			} catch (error) {
				await user.earn(amount);
				throw error;
			}
			await bet.reload();
			await interaction.reply(`Bet raised on **${bet.choice}** by **${amount}** to **${bet.amount}**`);
		}

		const embedFields = await buildBetFields(prediction);
		await updateStarterEmbed(interaction, embed => embed.setFields(embedFields));
		await interaction.followUp(paymentMessage(amount, balance));
	},
};
