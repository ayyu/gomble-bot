const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { RedemptionCommand } = require('../../models/Command');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('serverbanner')
	.setDescription('Change the server banner')
	.addStringOption(option => option
		.setName('attachment')
		.setDescription('URL of image for the banner')
		.setRequired(true));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	const attachment = interaction.options.getString('attachment');
	await interaction.guild.setBanner(attachment)
		.then(() => interaction.reply(`**Changed server banner** to ${attachment}.`));
}

module.exports = new RedemptionCommand(data, execute);
