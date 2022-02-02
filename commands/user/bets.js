const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User, Bet } = require('../../db/models');
const { unregisteredMsg } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('bets')
	.setDescription('Check your active bets');

module.exports = {
	data,
	async execute(interaction) {
		const target = interaction.member;

		const model = await User.findOne({
			where: { id: target.id },
			include: Bet,
		});
		if (!model) throw new Error(unregisteredMsg);

		console.log(model);
	},
};
