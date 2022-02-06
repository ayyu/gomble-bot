const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');
/**
 * @typedef {import('discord.js').CommandInteraction} CommandInteraction
 * @typedef {import('discord.js').GuildMember} GuildMember
 */

const operations = [
	'add',
	'delete',
	'clear',
];

const data = new SlashCommandSubcommandBuilder()
	.setName('hitlist')
	.setDescription('Options for managing list of victims')
	.addStringOption(option => option
		.setName('operation')
		.setDescription('Operation to perform')
		.addChoices(operations.map(operation => [operation, operation]))
		.setRequired(true))
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to add or remove'));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	/** @type {GuildMember} */
	const target = interaction.options.getMember('user');
	const operation = interaction.options.getString('operation');

	if (operation == 'add' || operation == 'delete') {
		if (!target) throw new Error('No target provided.');
		return configKV.get('hitlist')
			.then(value => configKV.set(
				'hitlist',
				Array.from(new Set(value ?? [])[operation](target.id)),
			))
			.then(() => interaction.reply(
				`${operation == 'add' ? 'Added' : 'Removed'} ${target.user.tag} to/from hitlist.`,
			));
	} else if (operation == 'clear') {
		return configKV.set('hitlist', [])
			.then(() => interaction.reply('Removed all users from hitlist.'));
	}
}

module.exports = new Command(data, execute);
