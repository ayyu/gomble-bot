const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models');
const { Command } = require('../../models/Command');

const data = new SlashCommandSubcommandBuilder()
	.setName('credit')
	.setDescription('Changes the balance of the target user')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to target')
		.setRequired(true))
	.addIntegerOption(option => option
		.setName('amount')
		.setDescription('Amount to credit')
		.setRequired(true));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.options.getMember('user');
	const amount = interaction.options.getInteger('amount');

	await User.findOne({ where: { id: target.id } })
		.then(model => model.earn(amount)
			.then(balance => interaction.reply(`${target}'s new balance is **${balance}**`)));
}

module.exports = new Command(data, execute);
