const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV } = require('../../db/keyv');
const { RedemptionCommand } = require('../../models/Command');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('fakedeath')
	.setDescription('Remove yourself from the hitlist');

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.member;
	return configKV.get('hitlist')
		.then(hitlist => {
			if (!hitlist.includes(target.id)) throw new Error('You\'re not on the hitlist.');
			return hitlist.filter(id => id != target.id);
		})
		.then(hitlist => configKV.set('hitlist', hitlist))
		.then(interaction.reply(`**Removed ${target}** from the hitlist.`));
}

module.exports = new RedemptionCommand(data, execute);
