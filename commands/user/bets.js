const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User, Bet } = require('../../db/models');
const { Command } = require('../models/Command');
const { unregisteredMsg, formatPairs } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('bets')
	.setDescription('Check a user\'s active bets')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to check'));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.options.getMember('user') ?? interaction.member;
	const model = await User.findOne({
		where: { id: target.id },
		include: Bet,
	});
	if (!model) throw new Error(unregisteredMsg);

	const betPairs = model.bets.map(bet => [
		`<#${bet.predictionId}>`,
		`${bet.amount} on ${bet.choice}`,
	]);
	await interaction.reply(formatPairs(
		'Active bets',
		betPairs,
		'No active bets found.',
	));
}

module.exports = new Command(data, execute);
