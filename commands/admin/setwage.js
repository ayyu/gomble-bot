const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { wagesKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');

const options = {
	interval: {
		type: 'String',
		description: 'How often to pay',
	},
	amount: {
		type: 'Integer',
		description: 'How much to pay',
	},
	initial: {
		type: 'Integer',
		description: 'How much users start with',
	},
	boost: {
		type: 'Number',
		description: 'Multiplier for boosters',
	},
	minbet: {
		type: 'Integer',
		description: 'Minimum bet amount',
	},
};

const data = new SlashCommandSubcommandBuilder()
	.setName('setwage')
	.setDescription('Change income settings');

for (const key in options) {
	data[`add${options[key].type}Option`](option => option
		.setName(key)
		.setDescription(options[key].description));
}

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	await interaction.reply('Updating wage settings.');
	for (const key in options) {
		const value = interaction.options[`get${options[key].type}`](key);
		if (value != null) {
			await wagesKV.set(key, value);
			await interaction.followUp(`Updated ${key} to ${value}`);
		}
	}
}

module.exports = new Command(data, execute);
