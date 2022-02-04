const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models');
const { RateRedemptionCommand } = require('../../models/Command');

const amountOption = 'amount';

const data = new SlashCommandSubcommandBuilder()
	.setName('akbar')
	.setDescription('Deduct from a user\'s points by paying a multiple of that amount')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to nuke')
		.setRequired(true))
	.addNumberOption(option => option
		.setName(amountOption)
		.setDescription('How many points to deduct from them')
		.setRequired(true));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.options.getMember('user');
	const amount = interaction.options.getNumber(amountOption);

	const targetModel = await User.findOne({ where: { id: target.id } });

	if (amount > targetModel.balance) throw new Error(`Target only has ${targetModel.balance} points. Choose a lower amount.`);

	await targetModel.spend(amount)
		.then(model => interaction.reply(
			`**${target}'s points nuked** by ${amount}. ${target}'s new balance: ${model.balance}`));
}

module.exports = new RateRedemptionCommand(data, execute, amountOption, 1);
