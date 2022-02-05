const path = require('path');
const { Collection } = require('discord.js');
const { configKV, pricesKV, wagesKV } = require('../db/keyv');
const { User } = require('../db/models');
const { absForEach } = require('../utils/fs');
const { paymentMessage, cantTargetSelfMsg } = require('../utils/messages');
/**
 * @typedef {import('@discordjs/builders').SlashCommandBuilder} SlashCommandBuilder
 * @typedef {import('@discordjs/builders').SlashCommandSubcommandBuilder} SlashCommandSubcommandBuilder
 * @typedef {import('discord.js').CommandInteraction} CommandInteraction
 * @typedef {import('fs').PathLike} PathLike
 */

/**
 * @callback CommandCallback
 * @param {CommandInteraction} interaction
 * @returns {Promise<any>}
 */

class Command {
	/**
	 * @param {SlashCommandBuilder|SlashCommandSubcommandBuilder} data
	 * @param {CommandCallback} execute - callback
	 */
	constructor(data, execute = null) {
		this.data = data;
		this._execute = execute;
	}

	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		if (this._execute) {
			return this._execute(interaction)
				.catch(error => this.error(error, interaction));
		}
	}

	/**
	 * @param {Error} error
	 * @param {CommandInteraction} interaction
	 */
	async error(error, interaction) {
		console.error(error);
		return interaction.reply({
			content: error.message,
			ephemeral: true,
		});
	}
}

class ParentCommand extends Command {
	/**
	 * @param {SlashCommandBuilder|SlashCommandSubcommandBuilder} data
	 * @param {PathLike} directory - directory of this command
	 * @param {CommandCallback} execute - callback
	 */
	constructor(data, directory, execute = null) {
		super(data, execute);
		/** @type {Collection<string, Command>} */
		this._subcommands = new Collection();
		absForEach(path.resolve(directory, this.data.name), /\.js$/, (dir, file) => {
			/** @type {Command} */
			const command = require(`${dir}/${file}`);
			this.data.addSubcommand(command.data);
			this._subcommands.set(command.data.name, command);
		});
	}
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		if (interaction.options.getSubcommand(false)) {
			const subcommand = this._subcommands.get(interaction.options.getSubcommand());
			if (subcommand) {
				return subcommand.execute(interaction)
					.catch(error => this.error(error, interaction));
			}
		}
	}
}

class RedemptionCommand extends Command {
	/**
	 * @param {SlashCommandBuilder|SlashCommandSubcommandBuilder} data
	 * @param {CommandCallback} execute - callback
	 */
	constructor(data, execute = null) {
		super(data, execute);
	}

	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		const member = interaction.member;
		const target = interaction.options.getMember('user') ?? interaction.options.getMember('target');

		let price = await this.getPrice(interaction);

		if (target) {
			if (member.id == target.id) throw new Error(cantTargetSelfMsg);
			if (!target.moderatable) throw new Error(`${target.user.tag} is not a valid target.`);
			const hitlist = await configKV.get('hitlist') ?? [];
			const discount = await wagesKV.get('discount') ?? 0.5;
			if (hitlist.includes(target.id)) price *= discount;
		}

		return User.findOne({ where: { id: member.id } })
			.then(user => user.spend(price)
				.then(() => this._execute(interaction))
				.then(
					() => interaction.followUp(paymentMessage(price, user.balance)),
					error => user.earn(price).then(() => super.error(error, interaction)),
				));
	}

	async getPrice() {
		return pricesKV.get(this.data.name);
	}
}

class RateRedemptionCommand extends RedemptionCommand {
	/**
	 * @param {SlashCommandBuilder|SlashCommandSubcommandBuilder} data
	 * @param {CommandCallback} execute - callback
	 * @param {string} amountOption - name of builder option to use as amount
	 * @param {number} denominator - amount to divide total price by
	 */
	constructor(data, execute = null, amountOption = 'amount', denominator = 1) {
		super(data, execute);
		this.amountOption = amountOption;
		this.denominator = denominator;
	}

	async getPrice(interaction) {
		return super.getPrice()
			.then(pricePerUnit =>
				pricePerUnit
				* interaction.options.getNumber(this.amountOption)
				/ this.denominator);
	}
}

module.exports = {
	Command,
	ParentCommand,
	RedemptionCommand,
	RateRedemptionCommand,
};
