const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { RedemptionCommand } = require('../../models/Command');

const data = new SlashCommandSubcommandBuilder()
	.setName('addemote')
	.setDescription('Add an emote to the server')
	.addStringOption(option => option
		.setName('attachment')
		.setDescription('URL of image for the emote')
		.setRequired(true))
	.addStringOption(option => option
		.setName('name')
		.setDescription('The name for the emote')
		.setRequired(true));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const attachment = interaction.options.getString('attachment');
	const name = interaction.options.getString('name');
	await interaction.guild.emojis.create(attachment, name)
		.then(emoji => interaction.reply(`**Added emote** <:${emoji.identifier}> as :${emoji.name}:`));
}

module.exports = new RedemptionCommand(data, execute);
