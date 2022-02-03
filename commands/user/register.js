const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { wagesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { Command } = require('../../models/Command');
const { registeredMsg } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('register')
	.setDescription('Register your account for prediction usage');

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const member = interaction.member;
	const initialBalance = await wagesKV.get('initial') ?? 0;
	const [, created] = await User.findOrCreate({
		where: { id: member.id },
		defaults: { balance: initialBalance },
	});
	if (!created) throw new Error(registeredMsg);
	await interaction.reply(`**Registered ${member.user.tag}** for predictions.`);
}

module.exports = new Command(data, execute);
