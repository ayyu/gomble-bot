const path = require('path');

const { Collection } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { absForEach } = require('../utils/fs')

const data = new SlashCommandBuilder()
	.setName('user')
	.setDescription('User management commands');

const subcommands = new Collection();
absForEach(path.resolve(__dirname, data.name), /\.js$/,
  (directory, file) => {
    const command = require(`${directory}/${file}`);
    data.addSubcommand(command.data);
		subcommands.set(command.data.name, command);
  }
);

module.exports = {
	data,
	async execute(interaction) {
		if (interaction.options.getSubcommand(false)) {
			const subcommand = subcommands.get(interaction.options.getSubcommand());
			if (!subcommand) return;
			await subcommand.execute(interaction);
		}
	},
};
