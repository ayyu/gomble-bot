const dotenv = require('dotenv');
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models');
const { wagesKV } = require('../../db/keyv');

dotenv.config();

const data = new SlashCommandSubcommandBuilder()
	.setName('register')
	.setDescription('Register your account for prediction usage');

module.exports = {
	data,
	async execute(interaction) {
		const user = interaction.member;
		const initialBalance = (await wagesKV.get('initial')) ?? 0;
		const [, created] = await User.findOrCreate({
			where: {id: user.id},
			defaults: {balance: initialBalance}
		});
		if (!created) throw new Error(`This user is already registered.`);
		await interaction.reply(`**Registered** ${user} for predictions.`);
	},
};
