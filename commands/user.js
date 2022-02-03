const { SlashCommandBuilder } = require('@discordjs/builders');
const { ParentCommand } = require('../models/Command');

const data = new SlashCommandBuilder()
	.setName('user')
	.setDescription('User management commands');

module.exports = new ParentCommand(data);