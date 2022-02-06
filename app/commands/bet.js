const { SlashCommandBuilder } = require('@discordjs/builders');
const { wagesKV } = require('../db/keyv');
const { Bet, User, Prediction } = require('../db/models');
const { Command } = require('../models/Command');
const { buildBetFields, updateStarterEmbed } = require('../utils/embeds');
const { paymentMessage, toggleMessages } = require('../utils/messages');
const { choiceNames, sanitizeOption } = require('../utils/enums');
const { requireThreaded } = require('../utils/threads');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandBuilder()
	.setName('bet')
	.setDescription('Place, raise, or check your bet. Leave options blank to check your bet.')
	.addStringOption(option => option
		.setName('amount')
		.setDescription('How much to wager. Valid options are integers and all'))
	.addIntegerOption(option => option
		.setName('choice')
		.setDescription('The outcome you want to bet on.')
		.addChoices(choiceNames.map(
			(name, value) => [sanitizeOption(name), value])));

/**
 * @param {number} amount
 * @param {number} choice
 * @param {Bet} bet
 * @throws {Error}
 */
function validateBetOptions(amount, choice, bet) {
	if (amount == null) throw new Error('You must choose an amount when placing or raising a bet.');
	if (choice == null && !bet) throw new Error('You must choose an outcome when placing a bet.');
	if (bet && choice != null && !!choice != bet.choice) throw new Error('You can\'t bet against your initial choice.');
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
	const choice = interaction.options.getInteger('choice');

	const userId = interaction.member.id;
	const predictionId = interaction.channel.id;

	const prediction = await Prediction.findOne({ where: { id: predictionId } });
	if (!prediction || !prediction.open) throw new Error(toggleMessages.betStatus[+false]);

	const user = await User.findOne({ where: { id: userId } });
	if (!user) throw new Error(toggleMessages.registered[+false]);

	const existingBet = await Bet.findOne({ where: { userId, predictionId } });

	if (amount == null && choice == null) {
		return interaction.reply(existingBet
			? `You have a bet of **${existingBet.amount}** on **${choiceNames[+existingBet.choice]}**`
			: 'No bet placed yet. Place a bet by specifying a choice and amount.');
	}

	validateBetOptions(amount, choice, existingBet);
	const minbet = await wagesKV.get('minbet') ?? 1;
	amount = parseAmount(amount, user, minbet);

	return user.spend(amount)
		.then(() => (existingBet)
			? existingBet.increment({ amount })
			: Bet.create({ userId, predictionId, choice: !!choice, amount }))
		.then(
			bet => bet.reload().then(() => interaction.reply(existingBet
				? `Bet raised on **${choiceNames[+bet.choice]}** by **${amount}** to **${bet.amount}**`
				: `New bet placed on **${choiceNames[+bet.choice]}** for **${amount}**`))
				.then(() => buildBetFields(prediction)
					.then(embeds => updateStarterEmbed(
						interaction, embed => embed.setFields(embeds)))
					.then(() => interaction.followUp(
						paymentMessage(amount, user.balance)))),
			error => user.earn(amount).then(() => { throw error; }),
		);
}

module.exports = new Command(data, execute);
