const ms = require('ms');
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { RateRedemptionCommand } = require('../../models/Command');
/**
 * @typedef {import('discord.js').CommandInteraction} CommandInteraction
 * @typedef {import('discord.js').GuildMember} GuildMember
 */

const durations = [
	'5 minutes',
	'15 minutes',
	'30 minutes',
	'1 hour',
	'6 hours',
	'12 hours',
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
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	/** @type {GuildMember} */
	const target = interaction.options.getMember('user');
	const duration = interaction.options.getNumber(amountOption);
	return target.timeout(duration)
		.then(member => interaction.reply(`**${member} timed out** for ${ms(duration, { long: true })}.`));
}

module.exports = new RateRedemptionCommand(data, execute, amountOption, ms('1 min'));
