const { SlashCommandBuilder } = require('@discordjs/builders');
const { ParentCommand } = require('../models/Command');

const data = new SlashCommandBuilder()
	.setName('prediction')
	.setDescription('Prediction management commands');

module.exports = new ParentCommand(data, __dirname);
