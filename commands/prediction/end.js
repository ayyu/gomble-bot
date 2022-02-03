const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, GuildMember } = require('discord.js');
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

module.exports = {
	data,
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		if (!requireThreaded(interaction)) throw new Error(threadOnlyMsg);

		const choice = interaction.options.getBoolean('result');

		const prediction = await Prediction.findOne({ where: { id: interaction.channel.id } });
		const [totalPool, payouts] = await prediction.end(choice);

		const replyEmbed = { title: `${choice ? 'Believers' : 'Doubters'} win!` };

		if (payouts) {
			replyEmbed.description = `**${totalPool}** go to ${Object.keys(payouts).length} winners`;
			await interaction.reply({ embeds: [replyEmbed] });

			for (const payee in payouts) {
				/** @type {GuildMember|String} */
				let member;
				try {
					member = await interaction.guild.members.fetch(payee);
				} catch (error) {
					console.log(error);
					member = 'Unknown Member';
				}
				await interaction.followUp(`${member} won **${payouts[payee]}**.`);
			}
		} else {
			replyEmbed.description = 'No winning bets placed. Refunding all bets.';
			await interaction.reply({ embeds: [replyEmbed] });
		}

		const starter = await updateStarterEmbed(interaction, embed => embed.setDescription(replyEmbed.title));
		await starter.unpin();
		await interaction.channel.setLocked(true);
		await interaction.channel.setArchived(true);
	},
};
