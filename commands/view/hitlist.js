const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { configKV, wagesKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('hitlist')
	.setDescription('View who\'s on the hitlist');

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	const discount = await wagesKV.get('discount') ?? 0.5;
	await configKV.get('hitlist')
		.then(list => interaction.guild.members.fetch({ user: list }))
		.then(members => members.map(member => `${member.user.tag}`))
		.then(hitlist => new MessageEmbed({
			title: `Redemptions targeting these users cost ${discount}x as much`,
			description: hitlist.reduce((value, tag) => value + `${tag}\n`, ''),
		}))
		.then(embed => interaction.reply({ embeds: [embed] }));
}

module.exports = new Command(data, execute);
