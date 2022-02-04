const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { wagesKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');
const { MessageEmbed } = require('discord.js');

const data = new SlashCommandSubcommandBuilder()
	.setName('wage')
	.setDescription('Checks the current server currency settings');

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const keys = ['interval', 'amount', 'initial', 'boost', 'minbet'];
	const settings = {};
	for (const key of keys) settings[key] = await wagesKV.get(key) ?? null;

	const embed = new MessageEmbed({
		title: 'Currency settings',
		fields: [
			{
				name: 'Payment tick interval',
				value: `\`\`\`${settings['interval']}\`\`\``,
			},
			{
				name: 'Payment amount per tick',
				value: `\`\`\`${settings['amount']}\`\`\``,
			},
			{
				name: 'Payment multiplier for boosters',
				value: `\`\`\`${settings['boost']}\`\`\``,
			},
			{
				name: 'Initial balance for new users',
				value: `\`\`\`${settings['initial']}\`\`\``,
			},
			{
				name: 'Minimum bet',
				value: `\`\`\`${settings['minbet']}\`\`\``,
			},
		],
	});

	await interaction.reply({ embeds: [embed] });
}

module.exports = new Command(data, execute);
