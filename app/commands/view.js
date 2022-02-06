const { SlashCommandBuilder } = require('@discordjs/builders');
const { ParentCommand } = require('../models/Command');

const data = new SlashCommandBuilder()
	.setName('view')
	.setDescription('View stats and settings');

module.exports = new ParentCommand(data, __dirname);
