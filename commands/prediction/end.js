const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { Prediction } = require('../../db/models');
const { updateStarterEmbed } = require('../../utils/embeds');
const { threadOnlyMsg, getGroupName } = require('../../utils/messages');
const { requireThreaded } = require('../../utils/threads');

const data = new SlashCommandSubcommandBuilder()
	.setName('end')
	.setDescription('Ends the prediction and pays out to winners')
	.addBooleanOption(option => option
		.setName('result')
		.setDescription('The correct result of the prediction')
		.setRequired(true));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

	const choice = interaction.options.getBoolean('result');

	const payouts = await Prediction.findOne({ where: { id: interaction.channel.id } })
		.then(prediction => prediction.end());

	const replyEmbed = new MessageEmbed({ title: `${getGroupName(choice)} win!` });
	const totalPool = payouts.reduce((total, amount) => total + amount, 0);
	replyEmbed.description = payouts.size
		? `**${totalPool}** go to ${payouts.size} winners`
		: 'No winning bets placed. Refunding all bets.';
	await interaction.reply({ embeds: [replyEmbed] })
		.then(() => Promise.all(payouts.map(async (amount, payee) => {
			/** @type {import('discord.js').GuildMember|string} */
			try {
				await interaction.guild.members.fetch(payee)
					.then(member => interaction.followUp(`${member} won **${amount}**.`));
			} catch (error) {
				console.error(error);
			}
		})));

	await updateStarterEmbed(interaction, embed => embed.setDescription(replyEmbed.title))
		.then(starter => starter.unpin())
		.then(() => interaction.reply({ embeds: [replyEmbed] }))
		.then(() => interaction.channel.setLocked(true))
		.then(() => interaction.channel.setArchived(true));
}

module.exports = {
	data,
	execute,
};
