const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { User, Bet, Prediction } = require('../../db/models');
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

		const description = `${model.bets.length} bets on active predictions`;

		const fields = [];
		for (const bet of model.bets) {
			/** @type {Prediction} */
			const prediction = await bet.getPrediction(interaction.guild);
			fields.push({
				name: prediction.prompt,
				value: `\`\`\`${bet.amount} on ${bet.choice}\`\`\``,
			});
		}
		const embed = {
			title: `${target.user.tag}'s active bets`,
			description,
			fields,
		};

		await interaction.reply({ embeds: [embed] });
	},
};
