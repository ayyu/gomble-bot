const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { User, Bet } = require('../../db/models');
const { unregisteredMsg } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('bets')
	.setDescription('Check a user\'s active bets')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to check'));

module.exports = {
	data,
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		const target = interaction.options.getMember('user') ?? interaction.member;

		const model = await User.findOne({
			where: { id: target.id },
			include: Bet,
		});
		if (!model) throw new Error(unregisteredMsg);

		let response = '**Active bets:**\n';
		const betList = model.bets.reduce((content, bet) => {
			return content + `<#${bet.predictionId}>: ${bet.amount} on ${bet.choice}\n`;
		}, '');
		response += (betList.length) ? betList : 'No active bets found.';
		await interaction.reply(response);
	},
};
