const path = require('path');
const { Collection } = require('discord.js');
const { absForEach } = require('../utils/fs');

class Command {
	/**
	 * @param {import('@discordjs/builders').SlashCommandBuilder|import('@discordjs/builders').SlashCommandSubcommandBuilder} data
	 * @param {Function} execute
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
	 * @param {import('@discordjs/builders').SlashCommandBuilder} data
	 * @param {Function} execute
	 */
	constructor(data, execute = null) {
		super(data, execute);
		this._subcommands = new Collection();
		absForEach(path.resolve(__dirname, this.data.name), /\.js$/, (directory, file) => {
			const command = require(`${directory}/${file}`);
			this.data.addSubcommand(command.data);
			this._subcommands.set(command.data.name, command);
		});
	}
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	async execute(interaction) {
		await super._execute(interaction);
		if (interaction.options.getSubcommand(false)) {
			const subcommand = this._subcommands.get(interaction.options.getSubcommand());
			if (!subcommand) return;
			await subcommand.execute(interaction);
		}
	}
}

module.exports = {
	Command,
	ParentCommand,
};