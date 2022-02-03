const ms = require('ms');
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { RateRedemptionCommand } = require('../../models/Command');

const durations = [
	'1 minute',
	'5 minutes',
	'15 minutes',
	'1 hour',
];

const amountOption = 'duration';

const data = new SlashCommandSubcommandBuilder()
	.setName('timeout')
	.setDescription('Times out a user. Price is per minute.')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to time out')
		.setRequired(true))
	.addNumberOption(option => option
		.setName(amountOption)
		.setDescription('How long to time out for')
		.setRequired(true)
		.addChoices(durations.map((duration) => [duration, ms(duration)])));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.options.getMember('user');
	const duration = interaction.options.getNumber(amountOption);
	await target.timeout(duration)
		.then(member => interaction.reply(`**${member} timed out** for ${ms(duration, { long: true })}.`));
}

module.exports = new RateRedemptionCommand(data, execute, amountOption, ms('1 min'));
