const { SlashCommandBuilder } = require('@discordjs/builders');
const { wagesKV } = require('../db/keyv');
const { Bet, User, Prediction } = require('../db/models');
const { Command } = require('../models/Command');
const { buildBetFields, updateStarterEmbed } = require('../utils/embeds');
const { paymentMessage, closeBetMsg, unregisteredMsg } = require('../utils/messages');
const { requireThreaded } = require('../utils/threads');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandBuilder()
	.setName('bet')
	.setDescription('Place, raise, or check your bet. Leave options blank to check your bet.')
	.addStringOption(option => option
		.setName('amount')
		.setDescription('How much to wager. Valid options are integers and all'))
	.addBooleanOption(option => option
		.setName('choice')
		.setDescription('The outcome you want to bet on.'));

/**
 * @param {number} amount
 * @param {boolean} choice
 * @param {Bet} bet
 * @throws {Error}
 */
function validateBetOptions(amount, choice, bet) {
	if (amount == null) throw new Error('You must choose an amount when placing or raising a bet.');
	if (choice == null && !bet) throw new Error('You must choose an outcome when placing a bet.');
	if (bet && choice != null && choice != bet.choice) throw new Error('You can\'t bet against your initial choice.');
}

/**
 * @param {number} amount
 * @param {User} User
 * @returns {number}
 * @throws {Error}
 */
function parseAmount(amount, user, minbet) {
	if (amount == 'all') {
		amount = user.balance;
	} else {
		if (isNaN(amount)) throw new Error('You can only use `all` or integers as amounts.');
		amount = parseInt(amount);
	}
	if (amount < (minbet ?? 1)) throw new Error(`Your bet must be at least ${minbet}.`);
	return amount;
}

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	requireThreaded(interaction);

	let amount = interaction.options.getString('amount');
	const choice = interaction.options.getBoolean('choice');

	const userId = interaction.member.id;
	const predictionId = interaction.channel.id;

	const prediction = await Prediction.findOne({ where: { id: predictionId } });
	if (!prediction || !prediction.open) throw new Error(closeBetMsg);

	const user = await User.findOne({ where: { id: userId } });
	if (!user) throw new Error(unregisteredMsg);

	const bet = await Bet.findOne({ where: { userId, predictionId } });

	if (amount == null && choice == null) {
		return interaction.reply(bet
			? `You have a bet of **${bet.amount}** on **${bet.choice}**`
			: 'No bet placed yet. Place a bet by specifying a choice and amount.');
	}

	validateBetOptions(amount, choice, bet);
	const minbet = await wagesKV.get('minbet') ?? 1;
	amount = parseAmount(amount, user, minbet);

	return user.spend(amount)
		.then(() => (bet)
			? bet.increment({ amount })
			: Bet.create({ userId, predictionId, choice, amount }))
		.then(
			model => model.reload()
				.then(() => (bet)
					? interaction.reply(`Bet raised on **${model.choice}** by **${amount}** to **${model.amount}**`)
					: interaction.reply(`New bet placed on **${model.choice}** for **${amount}**`),
				)
				.then(() => buildBetFields(prediction)
					.then(embeds => updateStarterEmbed(interaction, embed => embed.setFields(embeds)))
					.then(() => interaction.followUp(paymentMessage(amount, user.balance)))),
			error => user.earn(amount).then(() => { throw error; }),
		);
}

module.exports = new Command(data, execute);
