const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { RedemptionCommand } = require('../../models/Command');

const data = new SlashCommandSubcommandBuilder()
	.setName('changenick')
	.setDescription('Change a user\'s nickname')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to target')
		.setRequired(true))
	.addStringOption(option => option
		.setName('nick')
		.setDescription('Nickname to use')
		.setRequired(true));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.options.getMember('user');
	const nick = interaction.options.getString('nick');
	await target.setNickname(nick)
		.then(member => interaction.reply(`**Nickname changed** for ${member}`));
}

module.exports = new RedemptionCommand(data, execute);
