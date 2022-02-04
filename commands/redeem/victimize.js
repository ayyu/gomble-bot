const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV } = require('../../db/keyv');
const { RedemptionCommand } = require('../../models/Command');

const data = new SlashCommandSubcommandBuilder()
	.setName('victimize')
	.setDescription('Add a user to the hitlist')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to add or remove')
		.setRequired(true));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const target = interaction.options.getMember('user');

	/** @type {Array<string>} */
	const hitlist = await configKV.get('hitlist');
	if (hitlist.includes(target.id)) throw new Error('Target is already on hitlist.');
	hitlist.push(target.id);
	await configKV.set('hitlist', hitlist);
	return await interaction.reply(`**Added ${target}** to the hitlist.`);
}

module.exports = new RedemptionCommand(data, execute);
