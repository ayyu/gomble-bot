const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { pricesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { paymentMessage } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('serverbanner')
	.setDescription('Change the server banner')
	.addStringOption(option => option
		.setName('attachment')
		.setDescription('URL of image for the banner')
		.setRequired(true));

module.exports = {
	data,
	async execute(interaction) {
		const member = interaction.member;
		const user = await User.findOne({ where: { id: member.id } });

		const attachment = interaction.options.getString('attachment');
		const price = await pricesKV.get(data.name) ?? 0;

		const balance = await user.spend(price);
		try {
			await interaction.guild.setBanner(attachment);
		} catch (error) {
			await user.earn(price);
			throw error;
		}

		await interaction.reply(`Changed server banner to ${attachment}.`);
		await interaction.followUp(paymentMessage(price, balance));
	},
};
