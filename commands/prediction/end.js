const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { Prediction } = require('../../db/models');
const { updateStarterEmbed } = require('../../utils/embeds');
const { threadOnlyMsg } = require('../../utils/messages');
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

	const prediction = await Prediction.findOne({ where: { id: interaction.channel.id } });
	const payouts = await prediction.end(choice);

	const replyEmbed = new MessageEmbed({ title: `${choice ? 'Believers' : 'Doubters'} win!` });

	if (payouts.size) {
		const totalPool = payouts.reduce((total, bet) => total + bet.amount, 0);
		replyEmbed.description = `**${totalPool}** go to ${payouts.size} winners`;
		await interaction.reply({ embeds: [replyEmbed] });

		await Promise.all(payouts.map(async (amount, payee) => {
			/** @type {import('discord.js').GuildMember|string} */
			let member;
			try {
				member = await interaction.guild.members.fetch(payee);
			} catch (error) {
				console.log(error);
				member = 'Unknown Member';
			}
			await interaction.followUp(`${member} won **${amount}**.`);
		}));
	} else {
		replyEmbed.description = 'No winning bets placed. Refunding all bets.';
		await interaction.reply({ embeds: [replyEmbed] });
	}

	const starter = await updateStarterEmbed(interaction, embed => embed.setDescription(replyEmbed.title));
	await starter.unpin();
	await interaction.channel.setLocked(true);
	await interaction.channel.setArchived(true);
}

module.exports = {
	data,
	execute,
};
