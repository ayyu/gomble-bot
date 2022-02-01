const ms = require('ms');
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { User } = require('../../db/models');
const { paymentMessage } = require('../../utils/messages');

const durations = [
	'1 minute',
	'5 minutes',
	'15 minutes',
	'1 hour',
];

const data = new SlashCommandSubcommandBuilder()
	.setName('timeout')
	.setDescription(`Times out a user`)
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to time out')
		.setRequired(true))
	.addIntegerOption(option => option
		.setName('duration')
		.setDescription('How long to time out for')
		.setRequired(true)
		.addChoices(durations.map((duration) => [duration, ms(duration)])));

module.exports = {
	data,
	async execute(interaction) {
		const invoker = interaction.member;
		const target = interaction.options.getMember('user');
		const duration = interaction.options.getInteger('duration');

		if (invoker.id == target.id) throw new Error(`Can't target yourself`);
		if (!target.moderatable) throw new Error(`${target} is not a valid target.`);

		const invokerModel = await User.findOne({where: {id: invoker.id}});
		const pricePerMin = await pricesKV.get(data.name) ?? 0;
		const msPerMin = ms('1 min');
		const balance = await invokerModel.spend(Math.round(pricePerMin / msPerMin * duration));

		await target.timeout(duration);
		await interaction.reply(`${target} timed out for ${ms(duration, {long: true})}.`);
		await interaction.followUp(paymentMessage(price, balance));
	},
};
