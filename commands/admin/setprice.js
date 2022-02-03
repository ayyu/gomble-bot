const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { pricesKV } = require('../../db/keyv');

const data = new SlashCommandSubcommandBuilder()
	.setName('setprice')
	.setDescription('Sets the price for a redemption command')
	.addStringOption(option => option
		.setName('item')
		.setDescription('Redemption command name')
		.setRequired(true))
	.addIntegerOption(option => option
		.setName('price')
		.setDescription('Price for this redemption')
		.setRequired(true));

module.exports = {
	data,
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		const item = interaction.options.getString('item');
		const price = interaction.options.getInteger('price');

		await pricesKV.set(item, price);

		await interaction.reply(`Updated price of \`/${item}\` to ${price}.`);
	},
};