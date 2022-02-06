const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { Command } = require('../../models/Command');
const { updateStarterEmbed, colors } = require('../../utils/embeds');
const { betStatusNames } = require('../../utils/enums');
const { toggleMessages } = require('../../utils/messages');
const { requireThreaded } = require('../../utils/threads');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('set')
	.setDescription('Set status of prediction')
	.addIntegerOption(option => option
		.setName('status')
		.setDescription('Open or closed')
		.addChoices(betStatusNames.map((name, value) => [name, value]))
		.setRequired(true));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	requireThreaded(interaction);
	const choice = interaction.options.getInteger('status');
	const reply = toggleMessages.betStatus[choice];
	const color = choice ? colors.open : colors.closed;
	return Prediction.findOne({ where: { id: interaction.channel.id } })
		.then(prediction => prediction.update({ 'open': !!choice }))
		.then(() => updateStarterEmbed(interaction, embed => embed
			.setDescription(reply)
			.setColor(color)))
		.then(() => interaction.reply(reply));
}

module.exports = new Command(data, execute);
