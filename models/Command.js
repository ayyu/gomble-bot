const path = require('path');
const { Collection } = require('discord.js');
const { configKV, pricesKV } = require('../db/keyv');
const { User } = require('../db/models');
const { absForEach } = require('../utils/fs');
const { paymentMessage, cantTargetSelfMsg } = require('../../utils/messages');

class Command {
	/**
	 * @param {import('@discordjs/builders').SlashCommandBuilder|import('@discordjs/builders').SlashCommandSubcommandBuilder} data
	 * @param {Function} execute - callback
	 */
	constructor(data, execute = null) {
		this.data = data;
		this._execute = execute;
	}
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		if (this._execute) await this._execute(interaction);
	}
}

class ParentCommand extends Command {
	/**
	 * @param {import('@discordjs/builders').SlashCommandBuilder|import('@discordjs/builders').SlashCommandSubcommandBuilder} data
	 * @param {import('fs').PathLike} directory - directory of this command
	 * @param {Function} execute - callback
	 */
	constructor(data, directory, execute = null) {
		super(data, execute);
		this._subcommands = new Collection();
		absForEach(path.resolve(directory, this.data.name), /\.js$/, (dir, file) => {
			const command = require(`${dir}/${file}`);
			this.data.addSubcommand(command.data);
			this._subcommands.set(command.data.name, command);
		});
	}
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		await super.execute(interaction);
		if (interaction.options.getSubcommand(false)) {
			const subcommand = this._subcommands.get(interaction.options.getSubcommand());
			if (!subcommand) return;
			await subcommand.execute(interaction);
		}
	}
}

class RedemptionCommand extends Command {
	/**
	 * @param {import('@discordjs/builders').SlashCommandBuilder|import('@discordjs/builders').SlashCommandSubcommandBuilder} data
	 * @param {Function} execute - callback
	 */
	constructor(data, execute = null) {
		super(data, execute);
	}

	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		const member = interaction.member;
		const target = interaction.options.getMember('user');

		let price = await this.getPrice(interaction);

		if (target) {
			if (member.id == target.id) throw new Error(cantTargetSelfMsg);
			if (!target.moderatable) throw new Error(`${target.user.tag} is not a valid target.`);
			const hitlist = await configKV.get('hitlist') ?? [];
			const discountRate = await configKV.get('hitlistDiscount') ?? 0.5;
			if (hitlist.includes(target.id)) price *= discountRate;
		}

		const user = await User.findOne({ where: { id: member.id } });

		const balance = await user.spend(price);
		try {
			await super.execute(interaction);
		} catch (error) {
			await user.earn(price);
			throw error;
		}

		await interaction.followUp(paymentMessage(price, balance));
	}

	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	// eslint-disable-next-line no-unused-vars
	async getPrice(interaction = null) {
		const price = await pricesKV.get(this.data.name) ?? 0;
		return price;
	}
}

class RateRedemptionCommand extends RedemptionCommand {
	/**
	 * @param {import('@discordjs/builders').SlashCommandBuilder|import('@discordjs/builders').SlashCommandSubcommandBuilder} data
	 * @param {Function} execute - callback
	 * @param {string} amountOption - name of builder option to use as amount
	 * @param {number} denominator - amount to divide total price by
	 */
	constructor(data, execute = null, amountOption = 'amount', denominator = 1) {
		super(data, execute);
		this.amountOption = amountOption;
		this.denominator = denominator;
	}

	async getPrice(interaction = null) {
		const pricePerUnit = await super.getPrice(interaction);
		const amount = interaction.options.getNumber(this.amountOption);
		return pricePerUnit * amount / this.denominator;
	}
}

module.exports = {
	Command,
	ParentCommand,
	RedemptionCommand,
	RateRedemptionCommand,
};