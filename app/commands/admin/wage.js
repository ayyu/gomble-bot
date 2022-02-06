const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { wagesKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');
const { currencySettings } = require('../../utils/enums');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('wage')
	.setDescription('Change income settings');

for (const key in currencySettings) {
	data[`add${currencySettings[key].type}Option`](option => option
		.setName(key)
		.setDescription(currencySettings[key].description));
}

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	return interaction.reply('Updating wage settings.')
		.then(() => Promise.all(Object.keys(currencySettings).map(async (key) => {
			const value = interaction.options[`get${currencySettings[key].type}`](key);
			if (value == null) return;
			return wagesKV.set(key, value)
				.then(() => interaction.followUp(`Updated ${key} to ${value}`));
		})));
}

module.exports = new Command(data, execute);
