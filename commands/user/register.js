const dotenv = require('dotenv');
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models');
const { wagesKV } = require('../../db/keyv');
const { registeredMsg } = require('../../utils/messages');

dotenv.config();

const data = new SlashCommandSubcommandBuilder()
	.setName('register')
	.setDescription('Register your account for prediction usage');

module.exports = {
	data,
	async execute(interaction) {
		const member = interaction.member;
		const initialBalance = (await wagesKV.get('initial')) ?? 0;
		const [, created] = await User.findOrCreate({
			where: {id: member.id},
			defaults: {balance: initialBalance}
		});
		if (!created) throw new Error(registeredMsg);
		await interaction.reply(`**Registered** ${member.user.tag} for predictions.`);
	},
};
