const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV } = require('../../db/keyv');
const { RedemptionCommand } = require('../../models/Command');

const data = new SlashCommandSubcommandBuilder()
	.setName('fakedeath')
	.setDescription('Remove yourself from the hitlist');

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.member;
	/** @type {Array<string>} */
	const hitlist = await configKV.get('hitlist');
	if (!hitlist.includes(target.id)) throw new Error('You\'re not on the hitlist.');
	await configKV.set('hitlist', hitlist.filter(id => id != target.id));
	return await interaction.reply(`**Removed ${target}** from the hitlist.`);
}

module.exports = new RedemptionCommand(data, execute);
