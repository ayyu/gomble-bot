const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { RedemptionCommand } = require('../../models/Command');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('servericon')
	.setDescription('Change the server icon')
	.addStringOption(option => option
		.setName('attachment')
		.setDescription('URL of image for the icon')
		.setRequired(true));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	const attachment = interaction.options.getString('attachment');
	await interaction.guild.setIcon(attachment)
		.then(() => interaction.reply(`**Changed server icon** to ${attachment}.`));
}

module.exports = new RedemptionCommand(data, execute);
