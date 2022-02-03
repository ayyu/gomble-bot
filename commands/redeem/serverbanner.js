const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { RedemptionCommand } = require('../../models/Command');

const data = new SlashCommandSubcommandBuilder()
	.setName('serverbanner')
	.setDescription('Change the server banner')
	.addStringOption(option => option
		.setName('attachment')
		.setDescription('URL of image for the banner')
		.setRequired(true));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const attachment = interaction.options.getString('attachment');
	await interaction.guild.setBanner(attachment);
	await interaction.reply(`**Changed server banner** to ${attachment}.`);
}

module.exports = new RedemptionCommand(data, execute);