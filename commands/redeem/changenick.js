const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV, pricesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { paymentMessage, cantTargetSelfMsg } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
	.setName('changenick')
	.setDescription(`Change a user's nickname`)
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to target')
		.setRequired(true))
	.addStringOption(option => option
		.setName('nick')
		.setDescription('Nickname to use')
		.setRequired(true));

module.exports = {
	data,
	async execute(interaction) {
		const member = interaction.member;
		const target = interaction.options.getMember('user');
		const nick = interaction.options.getString('nick');
		
		if (member.id == target.id) throw new Error(cantTargetSelfMsg);

		const user = await User.findOne({where: {id: member.id}});
		let price = await pricesKV.get(data.name) ?? 0;
		const hitlist = await configKV.get('hitlist') ?? [];
		if (hitlist.includes(target.id)) price = Math.ceil(price/2);
		
		const balance = await user.spend(price);
		try {
			await target.setNickname(nick);
		} catch (error) {
			await user.earn(price);
			throw error;
		}
		
		await interaction.reply(`Nickname changed for ${target}`);
		await interaction.followUp(paymentMessage(price, balance));
	},
};
