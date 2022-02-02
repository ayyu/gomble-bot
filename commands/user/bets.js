const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User, Bet } = require('../../db/models');
const { unregisteredMsg } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('bets')
	.setDescription('Check a user\'s active bets')
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to check'));

module.exports = {
	data,
	async execute(interaction) {
		const target = interaction.options.getMember('user') ?? interaction.member;

		const model = await User.findOne({
			where: { id: target.id },
			include: Bet,
		});
		if (!model) throw new Error(unregisteredMsg);

		const description = `${model.bets.length} bets on active predictions`;

		const fields = [];
		for (const bet of model.bets) {
			const prompt = await bet.getPrompt(interaction.guild);
			fields.push({
				name: prompt,
				value: `\`\`\`${bet.amount} on ${bet.choice}\`\`\``,
			});
		}
		const embed = {
			title: `${target.user.tag}'s active bets`,
			description,
			fields,
		};

		await interaction.reply({ embeds: [embed] });
	},
};
