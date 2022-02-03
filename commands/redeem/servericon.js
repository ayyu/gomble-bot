const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { pricesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { paymentMessage } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('servericon')
	.setDescription('Change the server icon')
	.addStringOption(option => option
		.setName('attachment')
		.setDescription('URL of image for the icon')
		.setRequired(true));

module.exports = {
	data,
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		const member = interaction.member;
		const user = await User.findOne({ where: { id: member.id } });

		const attachment = interaction.options.getString('attachment');
		const price = await pricesKV.get(data.name) ?? 0;

		const balance = await user.spend(price);
		try {
			await interaction.guild.setIcon(attachment);
		} catch (error) {
			await user.earn(price);
			throw error;
		}

		await interaction.reply(`Changed server icon to ${attachment}.`);
		await interaction.followUp(paymentMessage(price, balance));
	},
};
