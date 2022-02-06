const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { RedemptionCommand } = require('../../models/Command');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('forcewatch')
	.setDescription('Force a user to watch a show of your choice')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to target')
		.setRequired(true))
	.addStringOption(option => option
		.setName('show')
		.setDescription('Show to watch')
		.setRequired(true));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	const member = interaction.member;
	const target = interaction.options.getMember('user');
	const show = interaction.options.getString('show');
	return interaction.reply({ content: `${member} forces ${target} to watch **${show}**`, fetchReply: true })
		.then(reply => reply.pin());
}

module.exports = new RedemptionCommand(data, execute);
