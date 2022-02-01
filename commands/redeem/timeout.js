const ms = require('ms');
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { paymentMessage } = require('../../utils/payment');
const { User } = require('../../db/models');

const durations = [
	'1 minute',
	'5 minutes',
	'15 minutes',
	'1 hour',
];

const pricePerMS = 1;
const pricePerMin = ms('1 min') * pricePerMS;

const data = new SlashCommandSubcommandBuilder()
	.setName('timeout')
	.setDescription(`Times out a user. Costs ${pricePerMin} points per minute of timeout.`)
	.addUserOption(option => option
		.setName('user')
		.setDescription('User to time out')
		.setRequired(true))
	.addStringOption(option => option
		.setName('duration')
		.setDescription('How long to time out for')
		.setRequired(true)
		.addChoices(durations.map((duration) => [duration, duration])));

module.exports = {
	data,
	async execute(interaction) {
		const target = interaction.options.getMember('user');
		if (interaction.member.id == target.id) throw new Error(`Can't target yourself`);
		if (!target.moderatable) throw new Error(`${target} is not a valid target.`);

		const duration = ms(interaction.options.getString('duration'));
		const reason = 'Timeout redeemed';
		const price = duration * pricePerMS;

		const user = await User.findOne({where: {id: target.id}});
		const balance = await user.spend(price);
		await target.timeout(duration, reason);
		await interaction.reply(`${target} timed out for ${ms(duration, {long: true})}.`);
		await interaction.followUp(paymentMessage(price, balance));
	},
};
