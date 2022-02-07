const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Sequelize } = require('sequelize');
const { User, Bet } = require('../../db/models');
const { Command } = require('../../models/Command');
const { toggleMessages } = require('../../utils/messages');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('balance')
	.setDescription('Check a users\'s point balance')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to check'));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.options.getMember('user') ?? interaction.member;
	return User.findOne({
		where: { id: target.id },
		attributes: [
			'balance',
			[Sequelize.fn('SUM', Sequelize.col('Bets.amount')), 'activeBetTotal'],
		],
		include: [{ model: Bet, attributes: []}],
	})
		.then(user => interaction.reply(
			`**${target.user.tag}'s balance:** ${user.balance} + ${user.activeBetTotal} on active bets.`))
		.catch(() => new Error(toggleMessages.registered[+false]));
}

module.exports = new Command(data, execute);
