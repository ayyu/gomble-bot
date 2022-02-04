const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { wagesKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');
const { currencySettings } = require('../../utils/currency');

const data = new SlashCommandSubcommandBuilder()
	.setName('wage')
	.setDescription('Change income settings');

for (const key in currencySettings) {
	data[`add${currencySettings[key].type}Option`](option => option
		.setName(key)
		.setDescription(currencySettings[key].description));
}

/**
 * @param {import('discord.js').CommandInteraction} interactionpro
 */
async function execute(interaction) {
	await interaction.reply('Updating wage settings.');
	await Promise.all(Object.keys(currencySettings).map(async (key) => {
		const value = interaction.options[`get${currencySettings[key].type}`](key);
		if (value != null) {
			return wagesKV.set(key, value)
				.then(() => interaction.followUp(`Updated ${key} to ${value}`));
		}
	}));
}

module.exports = new Command(data, execute);
