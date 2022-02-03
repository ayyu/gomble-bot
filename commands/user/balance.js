const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models');
const { Command } = require('../models/Command');
const { unregisteredMsg } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('balance')
	.setDescription('Check your or another user\'s points balance')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to check'));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.options.getMember('user') ?? interaction.member;
	const user = await User.findOne({ where: { id: target.id } });
	if (!user) throw new Error(unregisteredMsg);
	await interaction.reply(`**${target.user.tag}'s balance:** ${user.balance}`);
}

module.exports = new Command(data, execute);