const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { RedemptionCommand } = require('../../models/Command');

const data = new SlashCommandSubcommandBuilder()
	.setName('servericon')
	.setDescription('Change the server icon')
	.addStringOption(option => option
		.setName('attachment')
		.setDescription('URL of image for the icon')
		.setRequired(true));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const attachment = interaction.options.getString('attachment');
	await interaction.guild.setIcon(attachment);
	await interaction.reply(`**Changed server icon** to ${attachment}.`);
}

module.exports = new RedemptionCommand(data, execute);
