const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { currency } = require('../../kv/connect');

const data = new SlashCommandSubcommandBuilder()
	.setName('wage')
	.setDescription('Set the wage per tick')
	.addIntegerOption(option => option
		.setName('rate')
		.setDescription('wage/tick'));

module.exports = {
	data,
	async execute(interaction) {
		const target = interaction.member;
		const guild = interaction.guild;
		if (!target.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
		&& target.id != guild.ownerId) throw new Error(`You are not allowed to use this command.`);
	 	await currency.set('wage', interaction.options.getInteger('rate'));
		await interaction.reply(`Updated wage per tick.`);
	}
};
