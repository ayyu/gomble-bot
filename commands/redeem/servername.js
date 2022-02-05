const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { RedemptionCommand } = require('../../models/Command');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('servername')
	.setDescription('Change the server name')
	.addStringOption(option => option
		.setName('name')
		.setDescription('New name for server')
		.setRequired(true));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	const name = interaction.options.getString('name');
	await interaction.guild.setName(name)
		.then(() => interaction.reply(`**Changed server name** to ${name}.`));
}

module.exports = new RedemptionCommand(data, execute);
