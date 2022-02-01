const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models')
const { currency } = require('../../config.json')

const data = new SlashCommandSubcommandBuilder()
	.setName('register')
	.setDescription('Register your account for prediction usage');

module.exports = {
	data,
	async execute(interaction) {
		const target = interaction.member;
		try {
			await User.create({
				id: target.id,
				balance: currency.initial,
			});
		} catch (error) {
			error.errors.forEach(errorItem => {
				if (errorItem.type == 'unique violation') {
					error.message = `This user is already registered.`;
				}
			});
			throw error;
		}
		await interaction.reply(`**Registered** ${target} for predictions.`);
	},
};
