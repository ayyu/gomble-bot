const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV } = require('../../db/keyv');

const operations = [
	'add',
	'remove',
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
		.setDescription('User to add or remove')
		.setRequired(true));

module.exports = {
	data,
	async execute(interaction) {
		const target = interaction.options.getMember('user');
		const operation = interaction.option.getString('operation');

		switch (operation) {
			case 'add':
			case 'remove':
				const hitlist = await configKV.get('hitlist') ?? [];
				const hitlistSet = new Set(hitlist);
			case 'add':
				hitlistSet.add(target.id);
				await interaction.reply(`Added ${target.user.tag} to hitlist.`);
			case 'remove':
				hitlistSet.delete(target.id);
				await interaction.reply(`Removed ${target.user.tag} from hitlist.`);
			case 'add':
			case 'remove':
				await configKV.set('bitches', Array.from(bitchSet));
				break;
			case 'clear': {
				await configKV.delete('hitlist');
				await interaction.reply(`Removed all users from hitlist.`);
				break;
			}
		}
	}
};