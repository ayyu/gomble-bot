const { SlashCommandBuilder } = require('@discordjs/builders');
const { ParentCommand } = require('../models/Command');

const data = new SlashCommandBuilder()
	.setName('admin')
	.setDescription('Administrative commands');

module.exports = new ParentCommand(data, __dirname);