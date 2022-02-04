const path = require('path');
const { Collection } = require('discord.js');
const { configKV, pricesKV, wagesKV } = require('../db/keyv');
const { User } = require('../db/models');
const { absForEach } = require('../utils/fs');
const { paymentMessage, cantTargetSelfMsg } = require('../utils/messages');

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
		if (this._execute) {
			await this._execute(interaction)
				.catch(async error => this.error(error, interaction));
		}
	}

	/**
	 * @param {Error} error
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async error(error, interaction) {
		console.error(error);
		await interaction.reply({
			content: error.message,
			ephemeral: true,
		});
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
		if (interaction.options.getSubcommand(false)) {
			const subcommand = this._subcommands.get(interaction.options.getSubcommand());
			if (subcommand) {
				await subcommand.execute(interaction)
					.catch(async error => this.error(error, interaction));
			}
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
		const target = interaction.options.getMember('user') ?? interaction.options.getMember('target');

		let price = await this.getPrice(interaction);

		if (target) {
			if (member.id == target.id) throw new Error(cantTargetSelfMsg);
			if (!target.moderatable) throw new Error(`${target.user.tag} is not a valid target.`);
			const hitlist = await configKV.get('hitlist') ?? [];
			const discountRate = await wagesKV.get('discount') ?? 0.5;
			if (hitlist.includes(target.id)) price *= discountRate;
		}

		const user = await User.findOne({ where: { id: member.id } })
			.then(model => model.spend(price));

		if (this._execute) {
			this._execute(interaction)
				.catch(async error => {
					await user.earn(price);
					await super.error(error, interaction);
				});
		}
		await interaction.followUp(paymentMessage(price, user.balance));
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
		return await super.getPrice(interaction)
			.then(pricePerUnit => pricePerUnit * interaction.options.getNumber(this.amountOption) / this.denominator);
	}
}

module.exports = {
	Command,
	ParentCommand,
	RedemptionCommand,
	RateRedemptionCommand,
};
