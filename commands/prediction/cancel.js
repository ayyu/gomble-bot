const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { Prediction } = require('../../db/models');
const { updateStarterEmbed, colors } = require('../../utils/embeds');
const { threadOnlyMsg } = require('../../utils/messages');
const { requireThreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('cancel')
	.setDescription('Cancels this prediction and refunds all bets placed');

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

	const replyEmbed = new MessageEmbed({
		title: 'This prediction has been cancelled',
		description: 'All bets have been refunded',
	});

	await Prediction.findOne({ where: { id: interaction.channel.id } })
		.then(prediction => prediction.cancel());

	await updateStarterEmbed(interaction, embed => embed
		.setDescription(replyEmbed.title)
		.setColor(colors.cancelled))
		.then(starter => starter.unpin())
		.then(() => interaction.reply({ embeds: [replyEmbed] }))
		.then(() => interaction.channel.setLocked(true))
		.then(() => interaction.channel.setArchived(true));
}

module.exports = {
	data,
	execute,
};
