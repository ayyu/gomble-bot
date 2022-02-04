const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { configKV, wagesKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');

const data = new SlashCommandSubcommandBuilder()
	.setName('hitlist')
	.setDescription('View who\'s on the hitlist');

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	/** @type {Array<string>} */
	const discountRate = await wagesKV.get('discount') ?? 0.5;
	const hitlist = await configKV.get('hitlist')
		.then(list => interaction.guild.members.fetch({ user: list }))
		.then(members => members.map(member => `${member.user.tag}`));
	const embed = new MessageEmbed({
		title: `Redemptions targeting these users cost ${discountRate}x as much`,
		description: hitlist.reduce((value, tag) => value + `${tag}\n`, ''),
	});
	await interaction.reply({ embeds: [embed] });
}

module.exports = new Command(data, execute);
