const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { wagesKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');
const { currencySettings } = require('../../utils/currency');
/**
 * @typedef {import('discord.js').CommandInteraction} CommandInteraction
 * @typedef {import('discord.js').EmbedFieldData} EmbedFieldData
 */

const data = new SlashCommandSubcommandBuilder()
	.setName('wage')
	.setDescription('View various point settings');

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	await Promise.all(Object.keys(currencySettings).map(async key => {
		const value = await wagesKV.get(key);
		/** @type {EmbedFieldData} */
		const field = {
			name: currencySettings[key].description,
			value: `\`\`\`${value ?? 0}\`\`\``,
		};
		return field;
	}))
		.then(fields => new MessageEmbed({ title: 'Currency settings', fields }))
		.then(embed => interaction.reply({ embeds: [embed] }));
}

module.exports = new Command(data, execute);
