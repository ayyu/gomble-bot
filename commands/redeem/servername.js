const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { pricesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { paymentMessage } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('servername')
	.setDescription('Change the server name')
	.addStringOption(option => option
		.setName('name')
		.setDescription('New name for server')
		.setRequired(true));

module.exports = {
	data,
	async execute(interaction) {
		const member = interaction.member;
		const user = await User.findOne({ where: { id: member.id } });

		const name = interaction.options.getString('name');
		const price = await pricesKV.get(data.name) ?? 0;

		const balance = await user.spend(price);
		try {
			await interaction.guild.setName(name);
		} catch (error) {
			await user.earn(price);
			throw error;
		}

		await interaction.reply(`Changed server icon to ${name}.`);
		await interaction.followUp(paymentMessage(price, balance));
	},
};
