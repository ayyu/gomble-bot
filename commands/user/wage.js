const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { wagesKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');
const { currencySettings } = require('../../utils/currency');

const data = new SlashCommandSubcommandBuilder()
	.setName('wage')
	.setDescription('Checks the current server currency settings');

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const keys = ['interval', 'amount', 'initial', 'boost', 'minbet', 'discount'];
	const settings = {};
	for (const key of keys) settings[key] = await wagesKV.get(key) ?? null;

	const fields = await Promise.all(Object.keys(currencySettings).map(async key => ({
		name: currencySettings[key].description,
		value: `\`\`\`${await wagesKV.get(key) ?? 0}\`\`\``,
	})));

	const embed = new MessageEmbed({ title: 'Currency settings', fields });

	await interaction.reply({ embeds: [embed] });
}

module.exports = new Command(data, execute);
