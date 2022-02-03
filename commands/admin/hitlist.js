const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');

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
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.options.getMember('user');
	const operation = interaction.options.getString('operation');

	switch (operation) {
		case 'add':
		case 'delete': {
			if (!target) throw new Error('No target provided.');
			await configKV.get('hitlist')
				.then(value => {
					const hitlist = new Set(value ?? []);
					hitlist[operation](target.id);
					configKV.set('hitlist', Array.from(hitlist)).then(() => interaction.reply(
						`${operation == 'add' ? 'Added' : 'Removed'} ${target.user.tag} to/from hitlist.`,
					));
				});
			break;
		}
		case 'clear': {
			await configKV.delete('hitlist')
				.then(() => interaction.reply('Removed all users from hitlist.'));
			break;
		}
	}
}

module.exports = new Command(data, execute);
