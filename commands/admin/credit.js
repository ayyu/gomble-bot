const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { pricesKV } = require('../../db/keyv');
const { User } = require('../../db/models');

const data = new SlashCommandSubcommandBuilder()
	.setName('credit')
	.setDescription('Changes the balance of the target user')
	.addUserOption(option => option
    .setName('user')
    .setDescription('User to target')
    .setRequired(true))
  .addIntegerOption(option => option
		.setName('amount')
		.setDescription('Amount to credit')
		.setRequired(true));

module.exports = {
	data,
	async execute(interaction) {
    const target = interaction.options.getMember('user');
		const amount = interaction.options.getInteger('amount');
		const targetModel = await User.findOne({where: {id: target.id}});

		const balance = await targetModel.earn(amount);

		await interaction.reply(`${target}'s new balance is **${balance}**`);
	}
};