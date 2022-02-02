const ms = require('ms');
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV, pricesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { paymentMessage, cantTargetSelfMsg } = require('../../utils/messages');

const durations = [
	'1 minute',
	'5 minutes',
	'15 minutes',
	'1 hour',
];

const data = new SlashCommandSubcommandBuilder()
	.setName('timeout')
	.setDescription(`Times out a user. Price is per minute.`)
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
		const member = interaction.member;
		const target = interaction.options.getMember('user');
		const duration = interaction.options.getInteger('duration');

		if (member.id == target.id) throw new Error(cantTargetSelfMsg);
		if (!target.moderatable) throw new Error(`${target.user.tag} is not a valid target.`);

		const user = await User.findOne({where: {id: member.id}});
		const pricePerMin = await pricesKV.get(data.name) ?? 0;
		const msPerMin = ms('1 min');

		let price = pricePerMin / msPerMin * duration;
		const bitches = await configKV.get('bitches') ?? [];
		if (bitches.includes(target.id)) price /= 2;
		
		const balance = await user.spend(Math.ceil(price));
		try {
			await target.timeout(duration);
		} catch (error) {
			await user.earn(price);
			throw error;
		}

		await interaction.reply(`${target} timed out for ${ms(duration, {long: true})}.`);
		await interaction.followUp(paymentMessage(price, balance));
	},
};
