const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { wagesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { Command } = require('../../models/Command');
const { registeredMsg } = require('../../utils/messages');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('register')
	.setDescription('Register your account for prediction usage');

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	const member = interaction.member;
	const initialBalance = await wagesKV.get('initial') ?? 0;
	return User.findOrCreate({
		where: { id: member.id },
		defaults: { balance: initialBalance },
	})
		.then((_user, created) => {
			if (!created) throw new Error(registeredMsg);
		})
		.then(() => interaction.reply(`**Registered ${member.user.tag}** for predictions.`));
}

module.exports = new Command(data, execute);
