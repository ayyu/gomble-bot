const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models');
const { unregisteredMsg } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('balance')
	.setDescription(`Check your or another user's points balance`)
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to check'));

module.exports = {
	data,
	async execute(interaction) {
		const target = interaction.options.getMember('user') ?? interaction.member;
		const user = await User.findOne({
			where: {id: target.id}
		});
		if (!user) throw new Error(unregisteredMsg);
		await interaction.reply(
			`**${target.user.tag}'s balance:** ${user.balance}`
		);
	},
};
