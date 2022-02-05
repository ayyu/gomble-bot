const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User, Bet } = require('../../db/models');
const { Command } = require('../../models/Command');
const { unregisteredMsg, formatPairs, choiceStrings } = require('../../utils/messages');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('bets')
	.setDescription('Check a user\'s active bets')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to check'));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.options.getMember('user') ?? interaction.member;
	return User.findOne({ where: { id: target.id }, include: Bet })
		.then(model => {
			if (!model) throw new Error(unregisteredMsg);
			return model;
		})
		.then(model => model.bets.map(bet => [
			`<#${bet.predictionId}>`,
			`${bet.amount} on ${choiceStrings[bet.choice]}`,
		]))
		.then(pairs => interaction.reply(formatPairs(
			'Active bets',
			pairs,
			'No active bets found.',
		)));
}

module.exports = new Command(data, execute);
