const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models');
const { Command } = require('../../models/Command');
const { unregisteredMsg } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('balance')
	.setDescription('Check a users\'s point balance')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to check'));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.options.getMember('user') ?? interaction.member;
	await User.findOne({ where: { id: target.id } })
		.then(user => {
			if (!user) throw new Error(unregisteredMsg);
			return interaction.reply(`**${target.user.tag}'s balance:** ${user.balance}`);
		});
}

module.exports = new Command(data, execute);
