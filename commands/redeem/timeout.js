const ms = require('ms');
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { configKV, pricesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { paymentMessage, cantTargetSelfMsg } = require('../../utils/messages');
const { CommandInteraction } = require('discord.js');

const durations = [
	'1 minute',
	'5 minutes',
	'15 minutes',
	'1 hour',
];

const data = new SlashCommandSubcommandBuilder()
	.setName('timeout')
	.setDescription('Times out a user. Price is per minute.')
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
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		const member = interaction.member;
		const target = interaction.options.getMember('user');
		const duration = interaction.options.getInteger('duration');

		if (member.id == target.id) throw new Error(cantTargetSelfMsg);
		if (!target.moderatable) throw new Error(`${target.user.tag} is not a valid target.`);

		const user = await User.findOne({ where: { id: member.id } });
		const pricePerMin = await pricesKV.get(data.name) ?? 0;
		const msPerMin = ms('1 min');

		let price = pricePerMin / msPerMin * duration;
		const hitlist = await configKV.get('hitlist') ?? [];
		const discountRate = await configKV.get('hitlistDiscount') ?? 0.5;
		if (hitlist.includes(target.id)) price *= discountRate;

		const balance = await user.spend(price);
		try {
			await target.timeout(duration);
		} catch (error) {
			await user.earn(price);
			throw error;
		}

		await interaction.reply(`**${target} timed out** for ${ms(duration, { long: true })}.`);
		await interaction.followUp(paymentMessage(price, balance));
	},
};
