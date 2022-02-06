const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User, Bet } = require('../../db/models');
const { Command } = require('../../models/Command');
const { formatPairs, toggleMessages } = require('../../utils/messages');
const { choiceNames } = require('../../utils/enums');
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
			if (!model) throw new Error(toggleMessages.registered[+false]);
			return model;
		})
		.then(model => model.bets.map(bet => [
			`<#${bet.predictionId}>`,
			`${bet.amount} on ${choiceNames[+bet.choice]}`,
		]))
		.then(pairs => interaction.reply(formatPairs(
			'Active bets',
			pairs,
			'No active bets found.',
		)));
}

module.exports = new Command(data, execute);
