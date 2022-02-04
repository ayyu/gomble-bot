const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { pricesKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');

const data = new SlashCommandSubcommandBuilder()
	.setName('price')
	.setDescription('Sets the price for a redemption command')
	.addStringOption(option => option
		.setName('item')
		.setDescription('Redemption command name')
		.setRequired(true))
	.addIntegerOption(option => option
		.setName('price')
		.setDescription('Price for this redemption')
		.setRequired(true));

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const item = interaction.options.getString('item');
	const price = interaction.options.getInteger('price');

	await pricesKV.set(item, price)
		.then(() => interaction.reply(`Updated price of \`/${item}\` to ${price}.`));
}

module.exports = new Command(data, execute);
