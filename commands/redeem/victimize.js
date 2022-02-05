const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV } = require('../../db/keyv');
const { RedemptionCommand } = require('../../models/Command');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('victimize')
	.setDescription('Add a user to the hitlist')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to add')
		.setRequired(true));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.options.getMember('user');
	await configKV.get('hitlist')
		.then(hitlist => {
			if (hitlist.includes(target.id)) throw new Error('Target is already on hitlist.');
			hitlist.push(target.id);
			return hitlist;
		})
		.then(hitlist => configKV.set('hitlist', hitlist))
		.then(() => interaction.reply(`**Added ${target}** to the hitlist.`));
}

module.exports = new RedemptionCommand(data, execute);
